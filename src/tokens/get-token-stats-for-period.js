const elasticsearch = require('../util/elasticsearch');
const getDatesForTimePeriod = require('../util/get-dates-for-time-period');

const getTokenStatsForPeriod = async (token, period) => {
  const { dateFrom, dateTo } = getDatesForTimePeriod(period);
  const res = await elasticsearch.getClient().search({
    index: period === 'day' ? 'traded_tokens' : 'token_metrics_daily',
    body: {
      aggs: {
        tradeCount: {
          sum: {
            field: period === 'day' ? 'tradeCountContribution' : 'tradeCount',
          },
        },
        tradeVolume: {
          sum: { field: period === 'day' ? 'tradedAmount' : 'tradeVolume' },
        },
        tradeVolumeUSD: {
          sum: {
            field: period === 'day' ? 'tradedAmountUSD' : 'tradeVolumeUsd',
          },
        },
      },
      size: 0,
      query: {
        bool: {
          filter: [
            {
              term: {
                [period === 'day' ? 'tokenAddress' : 'address']: token.address,
              },
            },
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

  const { tradeCount, tradeVolume, tradeVolumeUSD } = res.body.aggregations;

  return {
    tradeCount: tradeCount.value,
    tradeVolume: {
      token: tradeVolume.value,
      USD: tradeVolumeUSD.value,
    },
  };
};

module.exports = getTokenStatsForPeriod;
