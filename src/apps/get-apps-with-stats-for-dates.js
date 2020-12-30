const _ = require('lodash');
const { FILL_ATTRIBUTION_TYPE } = require('../constants');

const AttributionEntity = require('../model/attribution-entity');
const elasticsearch = require('../util/elasticsearch');
const getPercentageChange = require('../util/get-percentage-change');
const getPreviousPeriod = require('../util/get-previous-period');

const getPreviousStats = async (appIds, dateFrom, dateTo) => {
  if (appIds.length === 0) {
    return [];
  }

  const { prevDateFrom, prevDateTo } = getPreviousPeriod(dateFrom, dateTo);
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
                bool: {
                  filter: [
                    { terms: { 'attributions.id': appIds } },
                    {
                      terms: {
                        'attributions.type': [0, 1],
                      },
                    },
                  ],
                },
              },
              aggs: {
                by_app: {
                  terms: {
                    field: 'attributions.id',
                    size: appIds.length,
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
                        activeTraders: {
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
            {
              range: {
                date: {
                  gte: prevDateFrom,
                  lte: prevDateTo,
                },
              },
            },
            {
              nested: {
                path: 'attributions',
                query: {
                  bool: {
                    filter: [
                      { terms: { 'attributions.id': appIds } },
                      {
                        terms: {
                          'attributions.type': [0, 1],
                        },
                      },
                    ],
                  },
                },
              },
            },
          ],
        },
      },
      size: 0,
    },
  });

  return response.body.aggregations.attributions.apps.by_app.buckets.map(
    bucket => {
      const appId = bucket.key;

      const getStatByType = (type, stat) => {
        const typeBucket = bucket.by_type.buckets.find(b => b.key === type);

        if (typeBucket === undefined) {
          return 0;
        }

        return typeBucket.attribution[stat].value;
      };

      return {
        activeTraders: bucket.totals.activeTraders.value,
        appId,
        tradeCount: {
          relayed: getStatByType(FILL_ATTRIBUTION_TYPE.RELAYER, 'tradeCount'),
          total: bucket.totals.tradeCount.value,
        },
        tradeVolume: {
          relayed: getStatByType(FILL_ATTRIBUTION_TYPE.RELAYER, 'tradeVolume'),
          total: bucket.totals.tradeVolume.value,
        },
      };
    },
  );
};

const getFilteredAppIds = async category => {
  if (category === undefined) {
    return undefined;
  }

  const apps = await AttributionEntity.find({
    categories: category,
  })
    .select('_id')
    .lean();

  return apps.map(entity => entity._id);
};

const getAppsByIds = async appIds => {
  const apps = await AttributionEntity.find({
    _id: { $in: appIds },
  }).lean();

  return apps;
};

const getStatsForDates = async (dateFrom, dateTo, options) => {
  const { category } = options;
  const { page, limit, sortBy, sortDirection } = _.defaults({}, options, {
    page: 1,
    limit: 20,
  });

  const filteredAppIds = await getFilteredAppIds(category);

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
                bool: {
                  filter: [
                    filteredAppIds !== undefined
                      ? { terms: { 'attributions.id': filteredAppIds } }
                      : undefined,
                    {
                      terms: {
                        'attributions.type': [0, 1],
                      },
                    },
                  ].filter(x => x !== undefined),
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
                      [`totals>${sortBy}`]: sortDirection,
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
                        activeTraders: {
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
                  bool: {
                    filter: [
                      filteredAppIds !== undefined
                        ? { terms: { 'attributions.id': filteredAppIds } }
                        : undefined,
                      {
                        terms: {
                          'attributions.type': [0, 1],
                        },
                      },
                    ].filter(x => x !== undefined),
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

  const stats = buckets.map(bucket => {
    const appId = bucket.key;

    const getStatByType = (type, stat) => {
      const typeBucket = bucket.by_type.buckets.find(b => b.key === type);

      if (typeBucket === undefined) {
        return 0;
      }

      return typeBucket.attribution[stat].value;
    };

    return {
      activeTraders: bucket.totals.activeTraders.value,
      appId,
      tradeCount: {
        relayed: getStatByType(FILL_ATTRIBUTION_TYPE.RELAYER, 'tradeCount'),
        total: bucket.totals.tradeCount.value,
      },
      tradeVolume: {
        relayed: getStatByType(FILL_ATTRIBUTION_TYPE.RELAYER, 'tradeVolume'),
        total: bucket.totals.tradeVolume.value,
      },
    };
  });

  return {
    appCount,
    stats,
  };
};

const getAppsWithStatsForDates = async (dateFrom, dateTo, options) => {
  const { appCount, stats } = await getStatsForDates(dateFrom, dateTo, options);
  const appIds = stats.map(stat => stat.appId);

  const [apps, prevStats] = await Promise.all([
    getAppsByIds(appIds),
    getPreviousStats(appIds, dateFrom, dateTo),
  ]);

  const appsWithStats = stats.map(stat => {
    const { activeTraders, appId, tradeCount, tradeVolume } = stat;

    const app = apps.find(r => r._id === appId);
    const prevStat = prevStats.find(s => s.appId === appId);
    const prevActiveTraders = _.get(prevStat, 'activeTraders', null);
    const prevTradeCountRelayed = _.get(prevStat, 'tradeCount.relayed', null);
    const prevTradeCountTotal = _.get(prevStat, 'tradeCount.total', null);
    const prevTradeVolumeRelayed = _.get(prevStat, 'tradeVolume.relayed', null);
    const prevTradeVolumeTotal = _.get(prevStat, 'tradeVolume.total', null);

    return {
      categories: app.categories,
      description: _.get(app, 'description', null),
      id: app._id,
      logoUrl: _.get(app, 'logoUrl', null),
      name: app.name,
      stats: {
        activeTraders,
        activeTradersChange: getPercentageChange(
          prevActiveTraders,
          activeTraders,
        ),
        tradeCount,
        tradeCountChange: {
          relayed: getPercentageChange(
            prevTradeCountRelayed,
            tradeCount.relayed,
          ),
          total: getPercentageChange(prevTradeCountTotal, tradeCount.total),
        },
        tradeVolume,
        tradeVolumeChange: {
          relayed: getPercentageChange(
            prevTradeVolumeRelayed,
            tradeVolume.relayed,
          ),
          total: getPercentageChange(prevTradeVolumeTotal, tradeVolume.total),
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

module.exports = getAppsWithStatsForDates;
