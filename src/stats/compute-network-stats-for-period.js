const _ = require('lodash');

const { ETH_TOKEN_DECIMALS } = require('../constants');
const elasticsearch = require('../util/elasticsearch');
const formatTokenAmount = require('../tokens/format-token-amount');
const getPreviousPeriod = require('../util/get-previous-period');
const getPercentageChange = require('../util/get-percentage-change');
const getDatesForTimePeriod = require('../util/get-dates-for-time-period');

const getBasicStatsForDates = async (dateFrom, dateTo, usePrecomputed) => {
  const results = await elasticsearch.getClient().search({
    index: usePrecomputed ? 'network_metrics_daily' : 'fills',
    body: {
      aggs: {
        protocolFeesETH: {
          sum: { field: usePrecomputed ? 'protocolFeesETH' : 'protocolFeeETH' },
        },
        protocolFeesUSD: {
          sum: { field: usePrecomputed ? 'protocolFeesUSD' : 'protocolFeeUSD' },
        },
        tradeCount: {
          sum: {
            field: usePrecomputed ? 'tradeCount' : 'tradeCountContribution',
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
    protocolFees: {
      ETH: formatTokenAmount(getValue('protocolFeesETH'), ETH_TOKEN_DECIMALS),
      USD: getValue('protocolFeesUSD'),
    },
    tradeCount: getValue('tradeCount'),
    tradeVolume: getValue('tradeVolume'),
  };
};

const computeNetworkStatsForDates = async period => {
  const { dateFrom, dateTo } = getDatesForTimePeriod(period);
  const { prevDateFrom, prevDateTo } = getPreviousPeriod(dateFrom, dateTo);

  const specifiedPeriodStats = await getBasicStatsForDates(
    dateFrom,
    dateTo,
    period !== 'day',
  );

  const previousPeriodStats = await getBasicStatsForDates(
    prevDateFrom,
    prevDateTo,
    period !== 'day',
  );

  return {
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
