const { ETH_TOKEN_DECIMALS } = require('../constants');
const elasticsearch = require('../util/elasticsearch');
const formatTokenAmount = require('../tokens/format-token-amount');
const getDatesForMetrics = require('../util/get-dates-for-metrics');
const padMetrics = require('./pad-metrics');

const getNetworkMetrics = async (period, granularity) => {
  const { dateFrom, dateTo } = getDatesForMetrics(period, granularity);

  const results = await elasticsearch.getClient().search({
    index: 'network_metrics_hourly',
    body: {
      aggs: {
        network_metrics_by_day: {
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
            protocolFeesETH: {
              sum: { field: 'protocolFeesETH' },
            },
            protocolFeesUSD: {
              sum: { field: 'protocolFeesUSD' },
            },
            tradeCount: {
              sum: { field: 'tradeCount' },
            },
            tradeVolume: {
              sum: { field: 'tradeVolume' },
            },
          },
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

  return padMetrics(
    results.body.aggregations.network_metrics_by_day.buckets.map(x => ({
      date: new Date(x.key_as_string),
      fillCount: x.fillCount.value,
      fillVolume: x.fillVolume.value,
      protocolFees: {
        ETH: formatTokenAmount(x.protocolFeesETH.value, ETH_TOKEN_DECIMALS),
        USD: x.protocolFeesUSD.value,
      },
      tradeCount: x.tradeCount.value,
      tradeVolume: x.tradeVolume.value,
    })),
    period,
    granularity,
    {
      fillCount: 0,
      fillVolume: 0,
      protocolFees: {
        ETH: '0',
        USD: 0,
      },
      tradeCount: 0,
      tradeVolume: 0,
    },
  );
};

module.exports = getNetworkMetrics;
