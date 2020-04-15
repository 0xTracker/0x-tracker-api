const _ = require('lodash');
const elasticsearch = require('../util/elasticsearch');

async function getTokenPrices(tokenAddresses, period) {
  const res = await elasticsearch.getClient().search({
    index: 'traded_tokens',
    body: {
      size: 0,
      query: {
        bool: {
          filter: [
            {
              terms: {
                tokenAddress: tokenAddresses,
              },
            },
            {
              range: {
                priceUSD: { gt: 0 },
              },
            },
            {
              range: {
                tradedAmountUSD: { gte: 1 },
              },
            },
          ],
        },
      },
      aggs: {
        allTime: {
          filter: {
            range: { date: { lte: period.to } },
          },
          aggs: {
            stats_by_token: {
              terms: {
                field: 'tokenAddress',
                size: tokenAddresses.length,
              },
              aggs: {
                lastTrade: {
                  top_hits: {
                    size: 1,
                    sort: {
                      date: {
                        order: 'desc',
                      },
                    },
                    _source: {
                      includes: ['date', 'fillId', 'priceUSD'],
                    },
                  },
                },
              },
            },
          },
        },
        selectedPeriod: {
          filter: {
            range: { date: { gte: period.from, lte: period.to } },
          },
          aggs: {
            stats_by_token: {
              terms: {
                field: 'tokenAddress',
                size: tokenAddresses.length,
              },
              aggs: {
                minPrice: {
                  min: { field: 'priceUSD' },
                },
                maxPrice: {
                  max: { field: 'priceUSD' },
                },
              },
            },
          },
        },
        previousPeriod: {
          filter: {
            range: {
              date: {
                lt: period.from,
              },
            },
          },
          aggs: {
            stats_by_token: {
              terms: {
                field: 'tokenAddress',
                size: tokenAddresses.length,
              },
              aggs: {
                lastTrade: {
                  top_hits: {
                    size: 1,
                    sort: {
                      date: {
                        order: 'desc',
                      },
                    },
                    _source: {
                      includes: ['fillId', 'priceUSD'],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const { aggregations } = res.body;
  const { allTime, previousPeriod, selectedPeriod } = aggregations;

  const prices = allTime.stats_by_token.buckets.map(bucket => {
    const tokenAddress = bucket.key;

    const selectedPeriodBucket = selectedPeriod.stats_by_token.buckets.find(
      b => b.key === tokenAddress,
    );

    const prevBucket = previousPeriod.stats_by_token.buckets.find(
      b => b.key === tokenAddress,
    );

    const { date, fillId, priceUSD } = _.get(
      bucket,
      'lastTrade.hits.hits.0._source',
      {},
    );

    const prevPrice = _.get(
      prevBucket,
      'lastTrade.hits.hits.0._source.priceUSD',
      null,
    );

    const minPrice = _.get(selectedPeriodBucket, 'minPrice.value', null);
    const maxPrice = _.get(selectedPeriodBucket, 'maxPrice.value', null);

    const priceChange =
      prevPrice === null ? null : ((priceUSD - prevPrice) / prevPrice) * 100;

    return {
      date,
      fillId,
      openPriceUSD: prevPrice,
      maxPriceUSD: maxPrice,
      minPriceUSD: minPrice,
      priceChange,
      priceUSD,
      tokenAddress,
    };
  });

  return prices;
}

module.exports = getTokenPrices;
