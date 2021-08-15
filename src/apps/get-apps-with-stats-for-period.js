const _ = require('lodash');
const { TIME_PERIOD } = require('../constants');
const AttributionEntity = require('../model/attribution-entity');
const AppStat = require('../model/app-stat');
const elasticsearch = require('../util/elasticsearch');
const getDatesForTimePeriod = require('../util/get-dates-for-time-period');
const getPercentageChange = require('../util/get-percentage-change');
const getPreviousPeriod = require('../util/get-previous-period');
const mapPeriodForAppStatsCollection = require('./map-period-for-app-stats-collection');

const getPreviousStats = async (appIds, dateFrom, dateTo, usePrecomputed) => {
  if (appIds.length === 0) {
    return [];
  }

  const { prevDateFrom, prevDateTo } = getPreviousPeriod(dateFrom, dateTo);

  const response = await elasticsearch.getClient().search({
    index: usePrecomputed ? 'app_metrics_daily' : 'app_fills',
    body: {
      aggs: {
        apps: {
          terms: {
            field: 'appId',
            size: appIds.length,
          },
          aggs: {
            relayedTradeCount: {
              sum: {
                field: 'relayedTradeCount',
              },
            },
            relayedTradeVolume: {
              sum: {
                field: 'relayedTradeValue',
              },
            },
            totalTradeCount: {
              sum: {
                field: 'totalTradeCount',
              },
            },
            totalTradeVolume: {
              sum: {
                field: 'totalTradeValue',
              },
            },
          },
        },
      },
      size: 0,
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
              terms: {
                appId: appIds,
              },
            },
          ],
        },
      },
    },
  });

  return response.body.aggregations.apps.buckets.map(bucket => {
    const appId = bucket.key;

    return {
      appId,
      tradeCount: {
        relayed: bucket.relayedTradeCount.value,
        total: bucket.totalTradeCount.value,
      },
      tradeVolume: {
        relayed: bucket.relayedTradeVolume.value,
        total: bucket.totalTradeVolume.value,
      },
    };
  });
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

const getTraderStatsForApps = async (appIds, period) => {
  if (typeof period !== 'string') {
    return null;
  }

  const appStats = await AppStat.find({
    appId: { $in: appIds },
    period: mapPeriodForAppStatsCollection(period),
  }).lean();

  return appStats;
};

const getDataset = async ({
  dateFrom,
  dateTo,
  period,
  options,
  usePrecomputed,
}) => {
  const { category } = options;
  const { page, limit, sortBy, sortDirection } = _.defaults({}, options, {
    page: 1,
    limit: 20,
  });

  const filteredAppIds = await getFilteredAppIds(category);
  const startIndex = (page - 1) * limit;

  /*
    When sorting by active traders we must fetch the initial dataset
    from MongoDB rather than Elasticsearch and then fetch other metrics
    for the apps from Elasticsearch afterwards.
  */
  if (sortBy === 'activeTraders') {
    const appStats = await AppStat.paginate(
      filteredAppIds
        ? {
            appId: { $in: filteredAppIds },
            period: mapPeriodForAppStatsCollection(period),
          }
        : {
            period: mapPeriodForAppStatsCollection(period),
          },
      {
        sort: { activeTraders: sortDirection === 'asc' ? 1 : -1 },
        limit,
        page,
        lean: true,
      },
    );

    const appIds = appStats.docs.map(x => x.appId);

    const otherStats = await elasticsearch.getClient().search({
      index: usePrecomputed ? 'app_metrics_daily' : 'app_fills',
      body: {
        aggs: {
          apps: {
            terms: {
              field: 'appId',
              size: appIds.length,
            },
            aggs: {
              relayedTradeCount: {
                sum: {
                  field: 'relayedTradeCount',
                },
              },
              relayedTradeVolume: {
                sum: {
                  field: 'relayedTradeValue',
                },
              },
              totalTradeCount: {
                sum: {
                  field: 'totalTradeCount',
                },
              },
              totalTradeVolume: {
                sum: {
                  field: 'totalTradeValue',
                },
              },
            },
          },
        },
        size: 0,
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
                terms: {
                  appId: appIds,
                },
              },
            ],
          },
        },
      },
    });

    return {
      appCount: appStats.total,
      stats: appStats.docs.map(appStat => {
        const otherStat = otherStats.body.aggregations.apps.buckets.find(
          b => b.key === appStat.appId,
        );

        return {
          activeTraders: appStat.activeTraders,
          activeTradersChange: _.get(appStat, 'activeTradersChange', null),
          appId: appStat.appId,
          tradeCount: {
            relayed: _.get(otherStat, 'relayedTradeCount.value', null),
            total: _.get(otherStat, 'totalTradeCount.value', null),
          },
          tradeVolume: {
            relayed: _.get(otherStat, 'relayedTradeVolume.value', null),
            total: _.get(otherStat, 'totalTradeVolume.value', null),
          },
        };
      }),
    };
  }

  /*
    When sorting by any other metric we must pull the initial dataset
    from Elasticsearch and then fetch active traders from MongoDB.
  */
  const response = await elasticsearch.getClient().search({
    index: usePrecomputed ? 'app_metrics_daily' : 'app_fills',
    body: {
      aggs: {
        apps: {
          terms: {
            field: 'appId',
            size: limit * page,
          },
          aggs: {
            relayedTradeCount: {
              sum: {
                field: 'relayedTradeCount',
              },
            },
            relayedTradeVolume: {
              sum: {
                field: 'relayedTradeValue',
              },
            },
            totalTradeCount: {
              sum: {
                field: 'totalTradeCount',
              },
            },
            totalTradeVolume: {
              sum: {
                field: 'totalTradeValue',
              },
            },
            bucket_truncate: {
              bucket_sort: {
                size: limit,
                from: startIndex,
                sort: [
                  {
                    [sortBy === 'tradeVolume'
                      ? 'totalTradeVolume'
                      : 'totalTradeCount']: { order: sortDirection },
                  },
                ],
              },
            },
          },
        },
        appCount: {
          cardinality: {
            field: 'appId',
          },
        },
      },
      size: 0,
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
            filteredAppIds
              ? {
                  terms: {
                    appId: filteredAppIds,
                  },
                }
              : undefined,
          ].filter(x => x !== undefined),
        },
      },
    },
  });

  const { buckets } = response.body.aggregations.apps;
  const appIds = buckets.map(b => b.key);
  const appCount = response.body.aggregations.appCount.value;
  const traderStats = await getTraderStatsForApps(appIds, period);

  const stats = buckets.map(bucket => {
    const appId = bucket.key;
    const traderStat = _.find(traderStats, s => s.appId === appId);

    return {
      activeTraders: _.get(traderStat, 'activeTraders', null),
      activeTradersChange: _.get(traderStat, 'activeTradersChange', null),
      appId,
      tradeCount: {
        relayed: bucket.relayedTradeCount.value,
        total: bucket.totalTradeCount.value,
      },
      tradeVolume: {
        relayed: bucket.relayedTradeVolume.value,
        total: bucket.totalTradeVolume.value,
      },
    };
  });

  return {
    appCount,
    stats,
  };
};

const getAppsWithStatsForPeriod = async (period, options) => {
  const usePrecomputed = period !== TIME_PERIOD.DAY;
  const { dateFrom, dateTo } = getDatesForTimePeriod(period);

  const { appCount, stats } = await getDataset({
    dateFrom,
    dateTo,
    period,
    usePrecomputed,
    options,
  });

  const appIds = stats.map(stat => stat.appId);

  const [apps, prevStats] = await Promise.all([
    getAppsByIds(appIds),
    period === TIME_PERIOD.ALL
      ? []
      : getPreviousStats(appIds, dateFrom, dateTo, usePrecomputed),
  ]);

  const appsWithStats = stats.map(stat => {
    const {
      activeTraders,
      activeTradersChange,
      appId,
      tradeCount,
      tradeVolume,
    } = stat;

    const app = apps.find(r => r._id === appId);
    const prevStat = prevStats.find(s => s.appId === appId);
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
        activeTradersChange,
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

module.exports = getAppsWithStatsForPeriod;
