const elasticsearch = require('../util/elasticsearch');
const getDatesForMetrics = require('../util/get-dates-for-metrics');

const getTokenMetrics = async (tokenAddress, period, granularity) => {
  const { dateFrom, dateTo } = getDatesForMetrics(period, granularity);

  const results = await elasticsearch.getClient().search({
    index: 'traded_tokens',
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
        },
      },
      size: 0,
      query: {
        bool: {
          filter: [
            {
              term: {
                tokenAddress,
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
    fillCount: x.doc_count,
    fillVolume: { token: x.fillVolume.value, USD: x.fillVolumeUSD.value },
    tradeCount: x.tradeCount.value,
    tradeVolume: { token: x.tradeVolume.value, USD: x.tradeVolume.value },
  }));

  return metrics;
};

module.exports = getTokenMetrics;
