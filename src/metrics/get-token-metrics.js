const elasticsearch = require('../util/elasticsearch');
const getDatesForMetrics = require('../util/get-dates-for-metrics');
const padMetrics = require('./pad-metrics');

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

  console.log(results.body.took);

  return padMetrics(
    results.body.aggregations.token_metrics.buckets.map(x => ({
      date: new Date(x.key_as_string),
      fillCount: x.doc_count,
      fillVolume: { token: x.fillVolume.value, USD: x.fillVolumeUSD.value },
      tradeCount: x.tradeCount.value,
      tradeVolume: { token: x.tradeVolume.value, USD: x.tradeVolume.value },
    })),
    period,
    granularity,
    {
      fillCount: 0,
      fillVolume: { token: '0', USD: 0 },
      tradeCount: 0,
      tradeVolume: { token: '0', USD: 0 },
    },
  );
};

module.exports = getTokenMetrics;
