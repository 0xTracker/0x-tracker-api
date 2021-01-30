const elasticsearch = require('../util/elasticsearch');
const getDatesForTimePeriod = require('../util/get-dates-for-time-period');
const getPercentageChange = require('../util/get-percentage-change');
const getPreviousPeriod = require('../util/get-previous-period');

const getTraderCount = async (relayerId, dateFrom, dateTo) => {
  const res = await elasticsearch.getClient().search({
    index: 'trader_fills',
    body: {
      aggs: {
        traderCount: {
          cardinality: { field: 'address' },
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

  const { traderCount } = res.body.aggregations;

  return traderCount.value;
};

const getStatsForDates = async (relayerId, dateFrom, dateTo) => {
  const [res, traderCount] = await Promise.all([
    elasticsearch.getClient().search({
      index: 'fills',
      body: {
        aggs: {
          tradeCount: {
            sum: { field: 'tradeCountContribution' },
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
    }),
    getTraderCount(relayerId, dateFrom, dateTo),
  ]);

  const { tokenCount, tradeCount, tradeVolume } = res.body.aggregations;

  return {
    tokenCount: tokenCount.value,
    tradeCount: tradeCount.value,
    traderCount,
    tradeVolume: tradeVolume.value,
  };
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
