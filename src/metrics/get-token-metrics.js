const elasticsearch = require('../util/elasticsearch');
const getDatesForMetrics = require('../util/get-dates-for-metrics');
const padMetrics = require('./pad-metrics');

const getTokenMetrics = async (tokenAddress, period, granularity) => {
  const { dateFrom, dateTo } = getDatesForMetrics(period, granularity);

  const results = await elasticsearch.getClient().search({
    index: 'traded_token_metrics_hourly',
    body: {
      aggs: {
        token_metrics: {
          date_histogram: {
            field: 'date',
            calendar_interval: granularity,
          },
          aggs: {
            fillCount: {
              sum: { field: 'fillCount' },
            },
            fillVolume: {
              sum: { field: 'fillVolume' },
            },
            fillVolumeUSD: {
              sum: { field: 'fillVolumeUSD' },
            },
            tradeCount: {
              sum: { field: 'tradeCount' },
            },
            tradeVolume: {
              sum: { field: 'tradeVolume' },
            },
            tradeVolumeUSD: {
              sum: { field: 'tradeVolumeUSD' },
            },
          },
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
              term: {
                tokenAddress,
              },
            },
          ],
        },
      },
    },
  });

  return padMetrics(
    results.body.aggregations.token_metrics.buckets.map(x => ({
      date: new Date(x.key_as_string),
      fillCount: x.fillCount.value,
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
