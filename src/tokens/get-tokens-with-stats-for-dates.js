const _ = require('lodash');

const { TOKEN_TYPE } = require('../constants');
const elasticsearch = require('../util/elasticsearch');
const getCdnTokenImageUrl = require('./get-cdn-token-image-url');
const getTokenPrices = require('./get-token-prices');
const Token = require('../model/token');

const getTokensWithStatsForDates = async (dateFrom, dateTo, options) => {
  const opts = _.defaults({}, options, {
    page: 1,
    limit: 20,
  });

  const startIndex = (opts.page - 1) * opts.limit;

  const res = await elasticsearch.getClient().search({
    index: 'traded_tokens',
    body: {
      aggs: {
        tokenStats: {
          terms: {
            field: 'tokenAddress',
            order: { tradeVolumeUSD: 'desc' },
            size: opts.page * opts.limit,
          },
          aggs: {
            fillCount: {
              value_count: { field: 'fillId' },
            },
            fillVolume: {
              sum: { field: 'filledAmount' },
            },
            fillVolumeUSD: {
              sum: { field: 'filledAmountUSD' },
            },
            tradeCount: {
              sum: { field: 'tradeCountContribution' },
            },
            tradeVolume: {
              sum: { field: 'tradedAmount' },
            },
            tradeVolumeUSD: {
              sum: { field: 'tradedAmountUSD' },
            },
            bucket_truncate: {
              bucket_sort: {
                size: opts.limit,
                from: startIndex,
              },
            },
          },
        },
        tokenCount: {
          cardinality: {
            field: 'tokenAddress',
          },
        },
      },
      size: 0,
      query: {
        bool: {
          filter: [
            opts.type === undefined
              ? undefined
              : { term: { tokenType: opts.type } },
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

  const tokenStats = res.body.aggregations.tokenStats.buckets;
  const tokenAddresses = tokenStats.map(x => x.key);
  const tokenCount = res.body.aggregations.tokenCount.value;

  const [tokens, prices] = await Promise.all([
    Token.find({
      address: { $in: tokenAddresses },
    }).lean(),
    getTokenPrices(tokenAddresses, { from: dateFrom, to: dateTo }),
  ]);

  return {
    tokens: tokenStats.map(stats => {
      const token = tokens.find(t => t.address === stats.key);
      const price = prices.find(t => t.tokenAddress === stats.key);

      const {
        address,
        circulatingSupply,
        imageUrl,
        name,
        symbol,
        totalSupply,
        type,
      } = token;

      const supply = _.isNil(circulatingSupply)
        ? totalSupply
        : circulatingSupply;

      const closePrice = _.get(price, 'priceUSD', null);
      const marketCap =
        supply === null || closePrice === null ? null : supply * closePrice;

      return {
        address,
        circulatingSupply: _.isFinite(circulatingSupply)
          ? circulatingSupply
          : null,
        imageUrl: _.isString(imageUrl) ? getCdnTokenImageUrl(imageUrl) : null,
        lastTrade: _.has(price, 'fillId')
          ? {
              date: price.date,
              id: price.fillId,
            }
          : null,
        marketCap,
        name: _.isString(name) ? name : null,
        price:
          token.type === TOKEN_TYPE.ERC20
            ? {
                change: _.get(price, 'priceChange', null),
                close: _.get(price, 'priceUSD', null),
                high: _.get(price, 'maxPriceUSD', null),
                last: _.get(price, 'priceUSD', null),
                low: _.get(price, 'minPriceUSD', null),
                open: _.get(price, 'openPriceUSD', null),
              }
            : {
                change: null,
                close: null,
                high: _.get(price, 'maxPriceUSD', null),
                last: null,
                low: _.get(price, 'minPriceUSD', null),
                open: null,
              },
        stats: {
          fillCount: stats.fillCount.value,
          fillVolume: {
            token: stats.fillVolume.value,
            USD: stats.fillVolumeUSD.value,
          },
          tradeCount: stats.tradeCount.value,
          tradeVolume: {
            token: stats.tradeVolume.value,
            USD: stats.tradeVolumeUSD.value,
          },
        },
        symbol: _.isString(symbol) ? symbol : null,
        totalSupply: _.isFinite(totalSupply) ? totalSupply : null,
        type,
      };
    }),
    resultCount: tokenCount,
  };
};

module.exports = getTokensWithStatsForDates;
