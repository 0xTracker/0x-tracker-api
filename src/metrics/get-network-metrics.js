const { ETH_TOKEN_DECIMALS } = require('../constants');
const elasticsearch = require('../util/elasticsearch');
const formatTokenAmount = require('../tokens/format-token-amount');
const getDatesForMetrics = require('../util/get-dates-for-metrics');
const padMetrics = require('./pad-metrics');

const getNetworkMetrics = async (period, granularity) => {
  const { dateFrom, dateTo } = getDatesForMetrics(period, granularity);

  const results = await elasticsearch.getClient().search({
    index: 'fills',
    body: {
      aggs: {
        network_metrics: {
          date_histogram: {
            field: 'date',
            calendar_interval: granularity,
          },
          aggs: {
            fillVolume: {
              sum: { field: 'value' },
            },
            protocolFeesETH: {
              sum: { field: 'protocolFeeETH' },
            },
            protocolFeesUSD: {
              sum: { field: 'protocolFeeUSD' },
            },
            tradeCount: {
              sum: { field: 'tradeCountContribution' },
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
    results.body.aggregations.network_metrics.buckets.map(x => ({
      date: new Date(x.key_as_string),
      fillCount: x.doc_count,
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
