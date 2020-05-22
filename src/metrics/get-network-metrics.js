const { ETH_TOKEN_DECIMALS } = require('../constants');
const buildFillsQuery = require('../fills/build-fills-query');
const elasticsearch = require('../util/elasticsearch');
const formatTokenAmount = require('../tokens/format-token-amount');
const getDatesForMetrics = require('../util/get-dates-for-metrics');

const getNetworkMetrics = async (period, granularity, filters) => {
  const { dateFrom, dateTo } = getDatesForMetrics(period, granularity);

  const results = await elasticsearch.getClient().search({
    index: 'fills',
    body: {
      aggs: {
        network_metrics: {
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
      query: buildFillsQuery({ ...filters, dateFrom, dateTo }),
    },
  });

  return results.body.aggregations.network_metrics.buckets.map(x => ({
    date: new Date(x.key_as_string),
    fillCount: x.doc_count,
    fillVolume: x.fillVolume.value,
    protocolFees: {
      ETH: formatTokenAmount(x.protocolFeesETH.value, ETH_TOKEN_DECIMALS),
      USD: x.protocolFeesUSD.value,
    },
    tradeCount: x.tradeCount.value,
    tradeVolume: x.tradeVolume.value,
  }));
};

module.exports = getNetworkMetrics;
