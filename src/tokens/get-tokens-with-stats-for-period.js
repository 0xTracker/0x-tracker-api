const _ = require('lodash');
const elasticsearch = require('../util/elasticsearch');
const getCdnTokenImageUrl = require('./get-cdn-token-image-url');
const getPercentageChange = require('../util/get-percentage-change');
const getPreviousPeriod = require('../util/get-previous-period');
const Token = require('../model/token');
const getDatesForTimePeriod = require('../util/get-dates-for-time-period');

const getStatsForPreviousPeriod = async (
  tokenAddresses,
  dateFrom,
  dateTo,
  usePrecomputed,
) => {
  const { prevDateFrom, prevDateTo } = getPreviousPeriod(dateFrom, dateTo);

  const res = await elasticsearch.getClient().search({
    index: usePrecomputed ? 'token_metrics_daily' : 'traded_tokens',
    body: {
      aggs: {
        tokenStats: {
          terms: {
            field: usePrecomputed ? 'address' : 'tokenAddress',
            size: tokenAddresses.length,
          },
          aggs: {
            tradeCount: {
              sum: {
                field: usePrecomputed ? 'tradeCount' : 'tradeCountContribution',
              },
            },
            tradeVolume: {
              sum: { field: usePrecomputed ? 'tradeVolume' : 'tradedAmount' },
            },
            tradeVolumeUSD: {
              sum: {
                field: usePrecomputed ? 'tradeVolumeUsd' : 'tradedAmountUSD',
              },
            },
            priced: {
              filter: {
                exists: { field: usePrecomputed ? 'closePrice' : 'priceUSD' },
              },
              aggs: {
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
              terms: {
                [usePrecomputed ? 'address' : 'tokenAddress']: tokenAddresses,
              },
            },
            {
              range: {
                date: {
                  gte: prevDateFrom,
                  lte: prevDateTo,
                },
              },
            },
          ],
        },
      },
    },
  });

  const { buckets } = res.body.aggregations.tokenStats;

  return tokenAddresses.map(tokenAddress => {
    const bucket = buckets.find(b => b.key === tokenAddress);

    return {
      price: {
        close: _.get(
          bucket,
          `priced.lastDoc.hits.hits[0]._source.${
            !usePrecomputed ? 'priceUSD' : 'closePrice'
          }`,
          null,
        ),
      },
      tradeCount: _.get(bucket, 'tradeCount.value', 0),
      tradeVolume: {
        token: _.get(bucket, 'tradeVolume.value', 0),
        USD: _.get(bucket, 'tradeVolumeUSD.value', 0),
      },
      tokenAddress,
    };
  });
};

const formatSortBy = sortBy => {
  if (sortBy === 'tradeVolume') {
    return 'tradeVolumeUSD';
  }

  return 'tradeCount';
};

const getTokensWithStatsForDates = async (period, options) => {
  const { dateFrom, dateTo } = getDatesForTimePeriod(period);

  const usePrecomputed = !options.type && period !== 'day';
  const startIndex = (options.page - 1) * options.limit;
  const sortBy = formatSortBy(options.sortBy);

  const res = await elasticsearch.getClient().search({
    index: !usePrecomputed ? 'traded_tokens' : 'token_metrics_daily',
    body: {
      aggs: {
        tokenStats: {
          terms: {
            field: !usePrecomputed ? 'tokenAddress' : 'address',
            order: { [sortBy]: options.sortDirection },
            size: options.page * options.limit,
          },
          aggs: {
            tradeCount: {
              sum: {
                field: !usePrecomputed
                  ? 'tradeCountContribution'
                  : 'tradeCount',
              },
            },
            tradeVolume: {
              sum: { field: !usePrecomputed ? 'tradedAmount' : 'tradeVolume' },
            },
            tradeVolumeUSD: {
              sum: {
                field: !usePrecomputed ? 'tradedAmountUSD' : 'tradeVolumeUsd',
              },
            },
            minPriceUSD: {
              min: {
                field: !usePrecomputed ? 'priceUSD' : 'minPrice',
              },
            },
            maxPriceUSD: {
              max: {
                field: !usePrecomputed ? 'priceUSD' : 'maxPrice',
              },
            },
            priced: {
              filter: {
                exists: { field: !usePrecomputed ? 'priceUSD' : 'openPrice' },
              },
              aggs: {
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
                        !usePrecomputed ? 'priceUSD' : 'openPrice',
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
                        !usePrecomputed ? 'priceUSD' : 'closePrice',
                      ],
                    },
                  },
                },
              },
            },
            bucket_truncate: {
              bucket_sort: {
                size: options.limit,
                from: startIndex,
              },
            },
          },
        },
        tokenCount: {
          cardinality: {
            field: !usePrecomputed ? 'tokenAddress' : 'address',
          },
        },
      },
      size: 0,
      query: {
        bool: {
          filter: [
            options.type === undefined
              ? undefined
              : { term: { tokenType: options.type } },
            {
              range: {
                date: {
                  gte: dateFrom,
                  lte: dateTo,
                },
              },
            },
          ].filter(f => f !== undefined),
        },
      },
    },
  });

  const { buckets } = res.body.aggregations.tokenStats;
  const tokenAddresses = buckets.map(x => x.key);
  const tokenCount = res.body.aggregations.tokenCount.value;

  const [tokens, previousStats] = await Promise.all([
    Token.find({
      address: { $in: tokenAddresses },
    }).lean(),
    getStatsForPreviousPeriod(tokenAddresses, dateFrom, dateTo, usePrecomputed),
  ]);

  return {
    tokens: buckets.map(bucket => {
      const token = tokens.find(t => t.address === bucket.key);
      const prev = previousStats.find(s => s.tokenAddress === bucket.key);

      const { address, imageUrl, name, symbol, type } = token;

      const closePrice = _.get(
        bucket,
        `priced.lastDoc.hits.hits[0]._source.${
          !usePrecomputed ? 'priceUSD' : 'closePrice'
        }`,
        null,
      );

      return {
        address,
        imageUrl: _.isString(imageUrl) ? getCdnTokenImageUrl(imageUrl) : null,
        name: _.isString(name) ? name : null,
        price: {
          change: getPercentageChange(prev.price.close, closePrice),
          high: bucket.maxPriceUSD.value,
          low: bucket.minPriceUSD.value,
          open: _.get(
            bucket,
            `priced.firstDoc.hits.hits[0]._source.${
              !usePrecomputed ? 'priceUSD' : 'openPrice'
            }`,
            null,
          ),
          close: closePrice,
        },
        stats: {
          tradeCount: bucket.tradeCount.value,
          tradeCountChange: getPercentageChange(
            prev.tradeCount,
            bucket.tradeCount.value,
          ),
          tradeVolume: {
            token: bucket.tradeVolume.value,
            USD: bucket.tradeVolumeUSD.value,
          },
          tradeVolumeChange: {
            token: getPercentageChange(
              prev.tradeVolume.token,
              bucket.tradeVolume.value,
            ),
            USD: getPercentageChange(
              prev.tradeVolume.USD,
              bucket.tradeVolumeUSD.value,
            ),
          },
        },
        symbol: _.isString(symbol) ? symbol : null,
        type,
      };
    }),
    resultCount: tokenCount,
  };
};

module.exports = getTokensWithStatsForDates;
