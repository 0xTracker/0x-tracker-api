const _ = require('lodash');
const { TIME_PERIOD } = require('../constants');
const AppStat = require('../model/app-stat');
const elasticsearch = require('../util/elasticsearch');
const getDatesForTimePeriod = require('../util/get-dates-for-time-period');
const getPercentageChange = require('../util/get-percentage-change');
const getPreviousPeriod = require('../util/get-previous-period');
const mapPeriodForAppStatsCollection = require('./map-period-for-app-stats-collection');

const getStatsForDates = async (
  appId,
  dateFrom,
  dateTo,
  { usePrecomputed },
) => {
  const res = await elasticsearch.getClient().search({
    index: usePrecomputed ? 'app_metrics_daily' : 'app_fills',
    body: {
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
                appId,
              },
            },
          ],
        },
      },
    },
  });

  const appStats = res.body.aggregations;
  const relayedTradeCount = appStats.relayedTradeCount.value;
  const relayedTradeVolume = appStats.relayedTradeVolume.value;
  const totalTradeCount = appStats.totalTradeCount.value;
  const totalTradeVolume = appStats.totalTradeVolume.value;

  return {
    avgTradeSize: totalTradeVolume / totalTradeCount,
    tradeCount: {
      relayed: relayedTradeCount,
      total: totalTradeCount,
    },
    tradeVolume: {
      relayed: relayedTradeVolume,
      total: totalTradeVolume,
    },
  };
};

const getActiveTradersForPeriod = async (appId, period) => {
  const appStat = await AppStat.findOne({
    appId,
    period: mapPeriodForAppStatsCollection(period),
  });

  if (!appStat) {
    return undefined;
  }

  return {
    activeTraders: appStat.activeTraders,
    activeTradersChange: appStat.activeTradersChange,
  };
};

const getAppStatsForPeriod = async (appId, period) => {
  const usePrecomputed = period !== TIME_PERIOD.DAY;
  const { dateFrom, dateTo } = getDatesForTimePeriod(period);
  const { prevDateFrom, prevDateTo } = getPreviousPeriod(dateFrom, dateTo);

  const [stats, prevStats, activeTradersStats] = await Promise.all([
    getStatsForDates(appId, dateFrom, dateTo, { usePrecomputed }),
    period === TIME_PERIOD.ALL
      ? undefined
      : await getStatsForDates(appId, prevDateFrom, prevDateTo, {
          usePrecomputed,
        }),
    typeof period === 'string'
      ? getActiveTradersForPeriod(appId, period)
      : undefined,
  ]);

  const { avgTradeSize, tradeCount, tradeVolume } = stats;

  const prevAvgTradeSize = _.get(prevStats, 'avgTradeSize', null);
  const prevTradeCountRelayed = _.get(prevStats, 'tradeCount.relayed', null);
  const prevTradeCountTotal = _.get(prevStats, 'tradeCount.total', null);
  const prevTradeVolumeRelayed = _.get(prevStats, 'tradeVolume.relayed', null);
  const prevTradeVolumeTotal = _.get(prevStats, 'tradeVolume.total', null);

  return {
    activeTraders: _.get(activeTradersStats, 'activeTraders', null),
    activeTradersChange: _.get(activeTradersStats, 'activeTradersChange', null),
    avgTradeSize,
    avgTradeSizeChange: getPercentageChange(prevAvgTradeSize, avgTradeSize),
    tradeCount,
    tradeCountChange: {
      relayed: getPercentageChange(prevTradeCountRelayed, tradeCount.relayed),
      total: getPercentageChange(prevTradeCountTotal, tradeCount.total),
    },
    tradeVolume: stats.tradeVolume,
    tradeVolumeChange: {
      relayed: getPercentageChange(prevTradeVolumeRelayed, tradeVolume.relayed),
      total: getPercentageChange(prevTradeVolumeTotal, tradeVolume.total),
    },
  };
};

module.exports = getAppStatsForPeriod;
