const elasticsearch = require('../util/elasticsearch');
const getDatesForTimePeriod = require('../util/get-dates-for-time-period');

const getTokenStatsForPeriod = async (token, period) => {
  const { dateFrom, dateTo } = getDatesForTimePeriod(period);
  const res = await elasticsearch.getClient().search({
    index: 'traded_tokens',
    body: {
      aggs: {
        fillCount: {
          value_count: { field: 'fillId' },
        },
        fillVolume: {
          sum: { field: 'filledAmount' },
        },
        fillVolumeUSD: {
          sum: { field: 'filledAmountUSD' },
        },
        tradeCount: {
          sum: { field: 'tradeCountContribution' },
        },
        tradeVolume: {
          sum: { field: 'tradedAmount' },
        },
        tradeVolumeUSD: {
          sum: { field: 'tradedAmountUSD' },
        },
      },
      size: 0,
      query: {
        bool: {
          filter: [
            { term: { tokenAddress: token.address } },
            {
              range: {
                date: {
                  gte: dateFrom,
                  lte: dateTo,
                },
              },
            },
          ],
        },
      },
    },
  });

  const {
    fillCount,
    fillVolume,
    fillVolumeUSD,
    tradeCount,
    tradeVolume,
    tradeVolumeUSD,
  } = res.body.aggregations;

  return {
    fillCount: fillCount.value,
    fillVolume: {
      token: fillVolume.value,
      USD: fillVolumeUSD.value,
    },
    tradeCount: tradeCount.value,
    tradeVolume: {
      token: tradeVolume.value,
      USD: tradeVolumeUSD.value,
    },
  };
};

module.exports = getTokenStatsForPeriod;
