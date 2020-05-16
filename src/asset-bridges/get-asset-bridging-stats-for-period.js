const _ = require('lodash');
const moment = require('moment');

const computeNetworkStatsForDates = require('../stats/compute-network-stats-for-dates');
const elasticsearch = require('../util/elasticsearch');
const getDatesForTimePeriod = require('../util/get-dates-for-time-period');

const getStatsForDates = async (dateFrom, dateTo) => {
  const networkStats = await computeNetworkStatsForDates(dateFrom, dateTo);
  const response = await elasticsearch.getClient().search({
    index: 'fills',
    body: {
      aggs: {
        fillCount: {
          value_count: { field: '_id' },
        },
        fillVolume: {
          sum: { field: 'value' },
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
  });

  const getValue = key => _.get(response.body.aggregations, `${key}.value`);

  const fillCount = getValue('fillCount');
  const fillVolume = getValue('fillVolume');
  const tradeCount = getValue('tradeCount');
  const tradeVolume = getValue('tradeVolume');

  return {
    fillCount,
    fillCountShare: (fillCount / networkStats.fillCount) * 100,
    fillVolume,
    fillVolumeShare: (fillVolume / networkStats.fillVolume) * 100,
    tradeCount,
    tradeCountShare: (tradeCount / networkStats.tradeCount) * 100,
    tradeVolume,
    tradeVolumeShare: (tradeVolume / networkStats.tradeVolume) * 100,
  };
};

const getPreviousPeriod = (dateFrom, dateTo) => {
  const diff = moment(dateTo).diff(dateFrom);
  const prevDateTo = moment(dateFrom)
    .subtract('millisecond', 1)
    .toDate();
  const prevDateFrom = moment(prevDateTo)
    .subtract('millisecond', diff)
    .toDate();

  return { prevDateFrom, prevDateTo };
};

const getPercentageChange = (valueA, valueB) => {
  if (valueA === 0) {
    return null;
  }

  return ((valueB - valueA) / valueA) * 100;
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
    fillCount: specifiedPeriodStats.fillCount,
    fillCountChange: getPercentageChange(
      previousPeriodStats.fillCount,
      specifiedPeriodStats.fillCount,
    ),
    fillCountShare: specifiedPeriodStats.fillCountShare,
    fillCountShareChange: getPercentageChange(
      previousPeriodStats.fillCountShare,
      specifiedPeriodStats.fillCountShare,
    ),
    fillVolume: specifiedPeriodStats.fillVolume,
    fillVolumeChange: getPercentageChange(
      previousPeriodStats.fillVolume,
      specifiedPeriodStats.fillVolume,
    ),
    fillVolumeShare: specifiedPeriodStats.fillVolumeShare,
    fillVolumeShareChange: getPercentageChange(
      previousPeriodStats.fillVolumeShare,
      specifiedPeriodStats.fillVolumeShare,
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
