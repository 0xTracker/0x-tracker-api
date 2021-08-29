const _ = require('lodash');
const { GRANULARITY } = require('../constants');
const elasticsearch = require('../util/elasticsearch');
const getDatesForMetrics = require('../util/get-dates-for-metrics');

const getTokenMetrics = async (tokenAddress, period, granularity) => {
  const usePrecomputed = granularity !== GRANULARITY.HOUR;
  const { dateFrom, dateTo } = getDatesForMetrics(period, granularity);

  const results = await elasticsearch.getClient().search({
    index: usePrecomputed ? 'token_metrics_daily' : 'traded_tokens',
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
                field: usePrecomputed ? 'tradeCount' : 'tradeCountContribution',
              },
            },
            tradeVolume: {
              sum: {
                field: usePrecomputed ? 'tradeVolume' : 'tradedAmount',
              },
            },
            tradeVolumeUSD: {
              sum: {
                field: usePrecomputed ? 'tradeVolumeUsd' : 'tradedAmountUSD',
              },
            },
            priced: {
              filter: {
                exists: { field: usePrecomputed ? 'openPrice' : 'priceUSD' },
              },
              aggs: {
                highPrice: {
                  max: { field: usePrecomputed ? 'maxPrice' : 'priceUSD' },
                },
                lowPrice: {
                  min: { field: usePrecomputed ? 'minPrice' : 'priceUSD' },
                },
                firstDoc: {
                  top_hits: {
                    size: 1,
                    sort: {
                      date: {
                        order: 'asc',
                      },
                    },
                    _source: {
                      includes: [
                        'date',
                        'fillId',
                        usePrecomputed ? 'openPrice' : 'priceUSD',
                      ],
                    },
                  },
                },
                lastDoc: {
                  top_hits: {
                    size: 1,
                    sort: {
                      date: {
                        order: 'desc',
                      },
                    },
                    _source: {
                      includes: [
                        'date',
                        'fillId',
                        usePrecomputed ? 'closePrice' : 'priceUSD',
                      ],
                    },
                  },
                },
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
                [usePrecomputed ? 'address' : 'tokenAddress']: tokenAddress,
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

  const metrics = results.body.aggregations.token_metrics.buckets.map(x => {
    return {
      date: new Date(x.key_as_string),
      price: {
        open: _.get(
          x,
          `priced.firstDoc.hits.hits[0]._source.${
            usePrecomputed ? 'openPrice' : 'priceUSD'
          }`,
          null,
        ),
        high: _.get(x, 'priced.highPrice.value', null),
        low: _.get(x, 'priced.lowPrice.value', null),
        close: _.get(
          x,
          `priced.lastDoc.hits.hits[0]._source.${
            usePrecomputed ? 'closePrice' : 'priceUSD'
          }`,
          null,
        ),
      },
      tradeCount: x.tradeCount.value,
      tradeVolume: { token: x.tradeVolume.value, USD: x.tradeVolumeUSD.value },
    };
  });

  return metrics;
};

module.exports = getTokenMetrics;
