const _ = require('lodash');
const { FILL_ATTRIBUTION_TYPE } = require('../constants');

const AttributionEntity = require('../model/attribution-entity');
const elasticsearch = require('../util/elasticsearch');

const getFilteredAttributionEntityIds = async category => {
  if (category === undefined) {
    return undefined;
  }

  const attributionEntities = await AttributionEntity.find({
    categories: category,
  })
    .select('_id')
    .lean();

  return attributionEntities.map(entity => entity._id);
};

const getAppsWithStatsForDates = async (dateFrom, dateTo, options) => {
  const { category } = options;
  const { page, limit } = _.defaults({}, options, {
    page: 1,
    limit: 20,
  });

  const filteredAppIds = await getFilteredAttributionEntityIds(category);

  const response = await elasticsearch.getClient().search({
    index: 'fills',
    body: {
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
                appCount: {
                  cardinality: {
                    field: 'attributions.id',
                  },
                },
                by_app: {
                  terms: {
                    field: 'attributions.id',
                    size: limit * page,
                    order: {
                      'totals>tradeVolume': 'desc',
                    },
                  },
                  aggs: {
                    totals: {
                      reverse_nested: {},
                      aggs: {
                        tradeCount: {
                          sum: {
                            field: 'tradeCountContribution',
                          },
                        },
                        traderCount: {
                          cardinality: {
                            field: 'traders',
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
                        from: (page - 1) * limit,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      query: {
        bool: {
          filter: [
            filteredAppIds !== undefined
              ? { terms: { appId: filteredAppIds } }
              : undefined,
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
                  terms: {
                    'attributions.type': [0, 1],
                  },
                },
              },
            },
          ].filter(f => f !== undefined),
        },
      },
      size: 0,
    },
  });

  const { buckets } = response.body.aggregations.attributions.apps.by_app;
  const appCount = response.body.aggregations.attributions.apps.appCount.value;

  const attributionEntityIds = buckets.map(bucket => bucket.key);
  const attributionEntities = await AttributionEntity.find({
    _id: { $in: attributionEntityIds },
  }).lean();

  const appsWithStats = buckets.map(bucket => {
    const attributionEntityId = bucket.key;
    const attributionEntity = attributionEntities.find(
      r => r._id === attributionEntityId,
    );

    const getStatByType = (type, stat) => {
      const typeBucket = bucket.by_type.buckets.find(b => b.key === type);

      if (typeBucket === undefined) {
        return 0;
      }

      return typeBucket.attribution[stat].value;
    };

    return {
      categories: attributionEntity.categories,
      description: _.get(attributionEntity, 'description', null),
      id: attributionEntity._id,
      logoUrl: _.get(attributionEntity, 'logoUrl', null),
      name: attributionEntity.name,
      stats: {
        activeTraders: bucket.totals.traderCount.value,
        tradeCount: {
          relayed: getStatByType(FILL_ATTRIBUTION_TYPE.RELAYER, 'tradeCount'),
          total: bucket.totals.tradeCount.value,
        },
        tradeVolume: {
          relayed: getStatByType(FILL_ATTRIBUTION_TYPE.RELAYER, 'tradeVolume'),
          total: bucket.totals.tradeVolume.value,
        },
      },
      urlSlug: attributionEntity.urlSlug,
      websiteUrl: _.get(attributionEntity, 'websiteUrl', null),
    };
  });

  return {
    apps: appsWithStats,
    resultCount: appCount,
  };
};

module.exports = getAppsWithStatsForDates;
