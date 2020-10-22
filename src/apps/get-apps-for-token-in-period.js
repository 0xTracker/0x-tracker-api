const _ = require('lodash');

const AttributionEntity = require('../model/attribution-entity');
const elasticsearch = require('../util/elasticsearch');
const getDatesForPeriod = require('../util/get-dates-for-time-period');

const getAppsForTokenInPeriod = async (tokenAddress, period, options) => {
  const { limit, page, sortBy } = options;
  const { dateFrom, dateTo } = getDatesForPeriod(period);

  const startIndex = (page - 1) * limit;

  const response = await elasticsearch.getClient().search({
    index: 'traded_tokens',
    body: {
      query: {
        bool: {
          filter: [
            {
              range: {
                date: {
                  gte: dateFrom,
                  lte: dateTo,
                },
              },
            },
            {
              term: {
                tokenAddress,
              },
            },
          ],
        },
      },
      aggs: {
        attributions: {
          nested: {
            path: 'attributions',
          },
          aggs: {
            apps: {
              filter: {
                terms: {
                  'attributions.type': [0, 1],
                },
              },
              aggs: {
                stats_by_app: {
                  terms: {
                    field: 'attributions.id',
                    size: limit * page,
                    order: { [`attribution>${sortBy}`]: 'desc' },
                  },
                  aggs: {
                    attribution: {
                      reverse_nested: {},
                      aggs: {
                        tradeCount: {
                          sum: {
                            field: 'tradeCountContribution',
                          },
                        },
                        tradeVolume: {
                          sum: {
                            field: 'tradedAmount',
                          },
                        },
                        tradeVolumeUSD: {
                          sum: {
                            field: 'tradedAmountUSD',
                          },
                        },
                      },
                    },
                    bucket_truncate: {
                      bucket_sort: {
                        size: limit,
                        from: startIndex,
                      },
                    },
                  },
                },
                appCount: {
                  cardinality: {
                    field: 'attributions.id',
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const aggregations = response.body.aggregations.attributions.apps;
  const { buckets } = aggregations.stats_by_app;
  const appIds = buckets.map(bucket => bucket.key);
  const apps = await AttributionEntity.find({ _id: { $in: appIds } }).lean();
  const appCount = aggregations.appCount.value;

  const appsWithStats = buckets.map(bucket => {
    const app = apps.find(a => a._id === bucket.key);

    return {
      categories: app.categories,
      description: _.get(app, 'description', null),
      id: app._id,
      logoUrl: _.get(app, 'logoUrl', null),
      name: app.name,
      stats: {
        tradeCount: bucket.attribution.tradeCount.value,
        tradeVolume: {
          token: bucket.attribution.tradeVolume.value,
          USD: bucket.attribution.tradeVolumeUSD.value,
        },
      },
      urlSlug: app.urlSlug,
      websiteUrl: _.get(app, 'websiteUrl', null),
    };
  });

  return {
    apps: appsWithStats,
    resultCount: appCount,
  };
};

module.exports = getAppsForTokenInPeriod;
