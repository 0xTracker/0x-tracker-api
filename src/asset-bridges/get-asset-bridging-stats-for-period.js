const _ = require('lodash');

const elasticsearch = require('../util/elasticsearch');
const getDatesForTimePeriod = require('../util/get-dates-for-time-period');
const getPercentageChange = require('../util/get-percentage-change');
const getPreviousPeriod = require('../util/get-previous-period');

const computeNetworkStatsForDates = async (dateFrom, dateTo) => {
  const results = await elasticsearch.getClient().search({
    index: 'fills',
    body: {
      aggs: {
        tradeCount: {
          sum: {
            field: 'tradeCountContribution',
          },
        },
        tradeVolume: {
          sum: { field: 'tradeVolume' },
        },
      },
      size: 0,
      query: {
        range: {
          date: {
            gte: dateFrom.toISOString(),
            lte: dateTo.toISOString(),
          },
        },
      },
    },
  });

  const getValue = key => _.get(results.body.aggregations, `${key}.value`);

  return {
    tradeCount: getValue('tradeCount'),
    tradeVolume: getValue('tradeVolume'),
  };
};

const getStatsForDates = async (dateFrom, dateTo) => {
  const [networkStats, response] = await Promise.all([
    computeNetworkStatsForDates(dateFrom, dateTo),
    elasticsearch.getClient().search({
      index: 'fills',
      body: {
        aggs: {
          bridgeCount: {
            cardinality: {
              field: 'assets.bridgeAddress',
            },
          },
          tradeCount: {
            sum: { field: 'tradeCountContribution' },
          },
          tradeVolume: {
            sum: { field: 'tradeVolume' },
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
                exists: {
                  field: 'assets.bridgeAddress',
                },
              },
            ],
          },
        },
      },
    }),
  ]);

  const getValue = key => _.get(response.body.aggregations, `${key}.value`);

  const bridgeCount = getValue('bridgeCount');
  const tradeCount = getValue('tradeCount');
  const tradeVolume = getValue('tradeVolume');

  return {
    bridgeCount,
    tradeCount,
    tradeCountShare: (tradeCount / networkStats.tradeCount) * 100,
    tradeVolume,
    tradeVolumeShare: (tradeVolume / networkStats.tradeVolume) * 100,
  };
};

const getAssetBridgingStatsForPeriod = async period => {
  const { dateFrom, dateTo } = getDatesForTimePeriod(period);
  const specifiedPeriodStats = await getStatsForDates(dateFrom, dateTo);

  if (period === 'all') {
    return specifiedPeriodStats;
  }

  const { prevDateFrom, prevDateTo } = getPreviousPeriod(dateFrom, dateTo);
  const previousPeriodStats = await getStatsForDates(prevDateFrom, prevDateTo);

  return {
    bridgeCount: specifiedPeriodStats.bridgeCount,
    bridgeCountChange: getPercentageChange(
      previousPeriodStats.bridgeCount,
      specifiedPeriodStats.bridgeCount,
    ),
    tradeCount: specifiedPeriodStats.tradeCount,
    tradeCountChange: getPercentageChange(
      previousPeriodStats.tradeCount,
      specifiedPeriodStats.tradeCount,
    ),
    tradeCountShare: specifiedPeriodStats.tradeCountShare,
    tradeCountShareChange: getPercentageChange(
      previousPeriodStats.tradeCountShare,
      specifiedPeriodStats.tradeCountShare,
    ),
    tradeVolume: specifiedPeriodStats.tradeVolume,
    tradeVolumeChange: getPercentageChange(
      previousPeriodStats.tradeVolume,
      specifiedPeriodStats.tradeVolume,
    ),
    tradeVolumeShare: specifiedPeriodStats.tradeVolumeShare,
    tradeVolumeShareChange: getPercentageChange(
      previousPeriodStats.tradeVolumeShare,
      specifiedPeriodStats.tradeVolumeShare,
    ),
  };
};

module.exports = getAssetBridgingStatsForPeriod;
