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
            { range: { date: { lt: period.to } } },
          ],
        },
      },
      aggs: {
        currentPrices: {
          terms: {
            field: 'tokenAddress',
            size: tokenAddresses.length,
          },
          aggs: {
            mostRecentTrade: {
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
        previousPrices: {
          terms: {
            field: 'tokenAddress',
            size: tokenAddresses.length,
          },
          aggs: {
            filter_by_date: {
              filter: {
                range: {
                  date: {
                    lt: period.from,
                  },
                },
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
                      includes: ['priceUSD'],
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

  const prices = res.body.aggregations.currentPrices.buckets.map(bucket => {
    const tokenAddress = bucket.key;
    const {
      date,
      fillId,
      priceUSD,
    } = bucket.mostRecentTrade.hits.hits[0]._source;

    const previousPriceBucket = res.body.aggregations.previousPrices.buckets.find(
      pb => pb.key === tokenAddress,
    );

    const previousPriceUSD = _.get(
      previousPriceBucket,
      'filter_by_date.lastTrade.hits.hits.0._source.priceUSD',
      null,
    );

    const priceChange =
      previousPriceUSD === null
        ? null
        : ((priceUSD - previousPriceUSD) / previousPriceUSD) * 100;

    return {
      date,
      fillId,
      priceChange,
      priceUSD,
      tokenAddress,
    };
  });

  return prices;
}

module.exports = getTokenPrices;
