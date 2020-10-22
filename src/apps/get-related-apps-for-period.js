const _ = require('lodash');
const { FILL_ATTRIBUTION_TYPE } = require('../constants');

const AttributionEntity = require('../model/attribution-entity');
const elasticsearch = require('../util/elasticsearch');
const getDatesForPeriod = require('../util/get-dates-for-time-period');

const getRelatedAppsForPeriod = async (appId, period, options) => {
  const { limit, page, sortBy } = options;
  const { dateFrom, dateTo } = getDatesForPeriod(period);

  const startIndex = (page - 1) * limit;

  const response = await elasticsearch.getClient().search({
    index: 'fills',
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
              nested: {
                path: 'attributions',
                query: {
                  term: {
                    'attributions.id': appId,
                  },
                },
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
                bool: {
                  filter: {
                    terms: {
                      'attributions.type': [0, 1],
                    },
                  },
                  must_not: {
                    term: {
                      'attributions.id': appId,
                    },
                  },
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
                            field: 'tradeVolume',
                          },
                        },
                      },
                    },
                    by_type: {
                      terms: {
                        field: 'attributions.type',
                        size: 10,
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
                                field: 'tradeVolume',
                              },
                            },
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

    const getStatByType = (type, stat) => {
      const typeBucket = bucket.by_type.buckets.find(b => b.key === type);

      if (typeBucket === undefined) {
        return 0;
      }

      return typeBucket.attribution[stat].value;
    };

    return {
      categories: app.categories,
      description: _.get(app, 'description', null),
      id: app._id,
      logoUrl: _.get(app, 'logoUrl', null),
      name: app.name,
      stats: {
        tradeCount: {
          relayer: getStatByType(FILL_ATTRIBUTION_TYPE.RELAYER, 'tradeCount'),
          consumer: getStatByType(FILL_ATTRIBUTION_TYPE.CONSUMER, 'tradeCount'),
          total: bucket.attribution.tradeCount.value,
        },
        tradeVolume: {
          relayer: getStatByType(FILL_ATTRIBUTION_TYPE.RELAYER, 'tradeVolume'),
          consumer: getStatByType(
            FILL_ATTRIBUTION_TYPE.CONSUMER,
            'tradeVolume',
          ),
          total: bucket.attribution.tradeVolume.value,
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

module.exports = getRelatedAppsForPeriod;
