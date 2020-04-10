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
              exists: {
                field: 'relayerId',
              },
            },
            {
              exists: {
                field: 'priceUSD',
              },
            },
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
          ],
        },
      },
      aggs: {
        selectedPeriod: {
          filter: {
            range: { date: { gt: period.from, lt: period.to } },
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
  const { previousPeriod, selectedPeriod } = aggregations;

  const prices = selectedPeriod.stats_by_token.buckets.map(bucket => {
    const { date, fillId, priceUSD } = bucket.lastTrade.hits.hits[0]._source;
    const tokenAddress = bucket.key;

    const prevBucket = previousPeriod.stats_by_token.buckets.find(
      b => b.key === tokenAddress,
    );

    const prevPrice = _.get(
      prevBucket,
      'lastTrade.hits.hits.0._source.priceUSD',
      null,
    );

    const minPrice = _.get(bucket, 'minPrice.value', null);
    const maxPrice = _.get(bucket, 'maxPrice.value', null);

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
