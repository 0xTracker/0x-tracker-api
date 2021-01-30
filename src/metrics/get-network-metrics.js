const { ETH_TOKEN_DECIMALS } = require('../constants');
const elasticsearch = require('../util/elasticsearch');
const formatTokenAmount = require('../tokens/format-token-amount');
const getDatesForMetrics = require('../util/get-dates-for-metrics');

const getNetworkMetrics = async (period, granularity) => {
  const { dateFrom, dateTo } = getDatesForMetrics(period, granularity);

  const results = await elasticsearch.getClient().search({
    index: granularity === 'hour' ? 'fills' : 'network_metrics_daily',
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
            protocolFeesETH: {
              sum: {
                field:
                  granularity === 'hour' ? 'protocolFeeETH' : 'protocolFeesETH',
              },
            },
            protocolFeesUSD: {
              sum: {
                field:
                  granularity === 'hour' ? 'protocolFeeUSD' : 'protocolFeesUSD',
              },
            },
            tradeCount: {
              sum: {
                field:
                  granularity === 'hour'
                    ? 'tradeCountContribution'
                    : 'tradeCount',
              },
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
            gte: dateFrom.toISOString(),
            lte: dateTo.toISOString(),
          },
        },
      },
    },
  });

  return results.body.aggregations.network_metrics.buckets.map(x => {
    return {
      date: new Date(x.key_as_string),
      protocolFees: {
        ETH: formatTokenAmount(x.protocolFeesETH.value, ETH_TOKEN_DECIMALS),
        USD: x.protocolFeesUSD.value,
      },
      tradeCount: x.tradeCount.value,
      tradeVolume: x.tradeVolume.value,
    };
  });
};

module.exports = getNetworkMetrics;
