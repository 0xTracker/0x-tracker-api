const _ = require('lodash');
const moment = require('moment');

const { ETH_TOKEN_DECIMALS } = require('../constants');
const elasticsearch = require('../util/elasticsearch');
const formatTokenAmount = require('../tokens/format-token-amount');

const getBasicStatsForDates = async (dateFrom, dateTo) => {
  const results = await elasticsearch.getClient().search({
    index: 'fills',
    body: {
      aggs: {
        fillCount: {
          value_count: { field: '_id' },
        },
        fillVolume: {
          sum: { field: 'value' },
        },
        protocolFeesETH: {
          sum: { field: 'protocolFeeETH' },
        },
        protocolFeesUSD: {
          sum: { field: 'protocolFeeUSD' },
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
        range: {
          date: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
      },
    },
  });

  const getValue = key => _.get(results.body.aggregations, `${key}.value`);

  return {
    fillCount: getValue('fillCount'),
    fillVolume: getValue('fillVolume'),
    protocolFees: {
      ETH: formatTokenAmount(getValue('protocolFeesETH'), ETH_TOKEN_DECIMALS),
      USD: getValue('protocolFeesUSD'),
    },
    tradeCount: getValue('tradeCount'),
    tradeVolume: getValue('tradeVolume'),
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

const computeNetworkStatsForDates = async (dateFrom, dateTo) => {
  const { prevDateFrom, prevDateTo } = getPreviousPeriod(dateFrom, dateTo);
  const specifiedPeriodStats = await getBasicStatsForDates(dateFrom, dateTo);
  const previousPeriodStats = await getBasicStatsForDates(
    prevDateFrom,
    prevDateTo,
  );

  return {
    fillCount: specifiedPeriodStats.fillCount,
    fillCountChange: getPercentageChange(
      previousPeriodStats.fillCount,
      specifiedPeriodStats.fillCount,
    ),
    fillVolume: specifiedPeriodStats.fillVolume,
    fillVolumeChange: getPercentageChange(
      previousPeriodStats.fillVolume,
      specifiedPeriodStats.fillVolume,
    ),
    protocolFees: specifiedPeriodStats.protocolFees,
    protocolFeesChange: getPercentageChange(
      previousPeriodStats.protocolFees.USD,
      specifiedPeriodStats.protocolFees.USD,
    ),
    tradeCount: specifiedPeriodStats.tradeCount,
    tradeCountChange: getPercentageChange(
      previousPeriodStats.tradeCount,
      specifiedPeriodStats.tradeCount,
    ),
    tradeVolume: specifiedPeriodStats.tradeVolume,
    tradeVolumeChange: getPercentageChange(
      previousPeriodStats.tradeVolume,
      specifiedPeriodStats.tradeVolume,
    ),
  };
};

module.exports = computeNetworkStatsForDates;
