const elasticsearch = require('../util/elasticsearch');
const getDatesForMetrics = require('../util/get-dates-for-metrics');

const getTokenMetrics = async (tokenAddress, period, granularity) => {
  const { dateFrom, dateTo } = getDatesForMetrics(period, granularity);

  const results = await elasticsearch.getClient().search({
    index: granularity === 'hour' ? 'traded_tokens' : 'token_metrics_daily',
    body: {
      aggs: {
        token_metrics: {
          date_histogram: {
            field: 'date',
            calendar_interval: granularity,
            extended_bounds: {
              min: dateFrom,
              max: dateTo,
            },
          },
          aggs: {
            tradeCount: {
              sum: {
                field:
                  granularity === 'hour'
                    ? 'tradeCountContribution'
                    : 'tradeCount',
              },
            },
            tradeVolume: {
              sum: {
                field: granularity === 'hour' ? 'tradedAmount' : 'tradeVolume',
              },
            },
            tradeVolumeUSD: {
              sum: {
                field:
                  granularity === 'hour' ? 'tradedAmountUSD' : 'tradeVolumeUsd',
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
              term: {
                [granularity === 'hour'
                  ? 'tokenAddress'
                  : 'address']: tokenAddress,
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

  const metrics = results.body.aggregations.token_metrics.buckets.map(x => ({
    date: new Date(x.key_as_string),
    tradeCount: x.tradeCount.value,
    tradeVolume: { token: x.tradeVolume.value, USD: x.tradeVolumeUSD.value },
  }));

  return metrics;
};

module.exports = getTokenMetrics;
