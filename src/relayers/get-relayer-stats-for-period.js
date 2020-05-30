const moment = require('moment');

const elasticsearch = require('../util/elasticsearch');
const getDatesForTimePeriod = require('../util/get-dates-for-time-period');

const getStatsForDates = async (relayerId, dateFrom, dateTo) => {
  const res = await elasticsearch.getClient().search({
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
        traderCount: {
          cardinality: { field: 'traders' },
        },
        tradeVolume: {
          sum: { field: 'tradeVolume' },
        },
        tokenCount: {
          cardinality: { field: 'assets.tokenAddress' },
        },
      },
      size: 0,
      query: {
        bool: {
          filter: [
            relayerId !== null ? { term: { relayerId } } : undefined,
            {
              range: {
                date: {
                  gte: dateFrom,
                  lte: dateTo,
                },
              },
            },
          ].filter(f => f !== undefined),
          must_not:
            relayerId === null
              ? [{ exists: { field: 'relayerId' } }]
              : undefined,
        },
      },
    },
  });

  const {
    fillCount,
    fillVolume,
    tokenCount,
    tradeCount,
    traderCount,
    tradeVolume,
  } = res.body.aggregations;

  return {
    fillCount: fillCount.value,
    fillVolume: fillVolume.value,
    tokenCount: tokenCount.value,
    tradeCount: tradeCount.value,
    traderCount: traderCount.value,
    tradeVolume: tradeVolume.value,
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

const getRelayerStatsForPeriod = async (relayerId, period) => {
  const { dateFrom, dateTo } = getDatesForTimePeriod(period);
  const { prevDateFrom, prevDateTo } = getPreviousPeriod(dateFrom, dateTo);
  const stats = await getStatsForDates(relayerId, dateFrom, dateTo);
  const prevStats = await getStatsForDates(relayerId, prevDateFrom, prevDateTo);

  return {
    activeTraders: stats.traderCount,
    activeTradersChange: getPercentageChange(
      prevStats.traderCount,
      stats.traderCount,
    ),
    fillCount: stats.fillCount,
    fillCountChange: getPercentageChange(prevStats.fillCount, stats.fillCount),
    fillVolume: stats.fillVolume,
    fillVolumeChange: getPercentageChange(
      prevStats.fillVolume,
      stats.fillVolume,
    ),
    tradeCount: stats.tradeCount,
    tradeCountChange: getPercentageChange(
      prevStats.tradeCount,
      stats.tradeCount,
    ),
    tradeVolume: stats.tradeVolume,
    tradeVolumeChange: getPercentageChange(
      prevStats.tradeVolume,
      stats.tradeVolume,
    ),
    tradedTokens: stats.tokenCount,
    tradedTokensChange: getPercentageChange(
      prevStats.tokenCount,
      stats.tokenCount,
    ),
  };
};

module.exports = getRelayerStatsForPeriod;
