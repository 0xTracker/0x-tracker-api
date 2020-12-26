const _ = require('lodash');

const { TOKEN_TYPE } = require('../constants');
const elasticsearch = require('../util/elasticsearch');
const getCdnTokenImageUrl = require('./get-cdn-token-image-url');
const getPercentageChange = require('../util/get-percentage-change');
const getPreviousPeriod = require('../util/get-previous-period');
const getTokenPrices = require('./get-token-prices');
const Token = require('../model/token');

const getStatsForPreviousPeriod = async (tokenAddresses, dateFrom, dateTo) => {
  const { prevDateFrom, prevDateTo } = getPreviousPeriod(dateFrom, dateTo);

  const res = await elasticsearch.getClient().search({
    index: 'traded_tokens',
    body: {
      aggs: {
        tokenStats: {
          terms: {
            field: 'tokenAddress',
            size: tokenAddresses.length,
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
          },
        },
      },
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
                date: {
                  gte: prevDateFrom,
                  lte: prevDateTo,
                },
              },
            },
          ].filter(f => f !== undefined),
        },
      },
    },
  });

  const { buckets } = res.body.aggregations.tokenStats;

  return tokenAddresses.map(tokenAddress => {
    const bucket = buckets.find(b => b.key === tokenAddress);

    return {
      fillCount: _.get(bucket, 'doc_count', 0),
      fillVolume: {
        token: _.get(bucket, 'fillVolume.value', 0),
        USD: _.get(bucket, 'fillVolumeUSD.value', 0),
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

  const { buckets } = res.body.aggregations.tokenStats;
  const tokenAddresses = buckets.map(x => x.key);
  const tokenCount = res.body.aggregations.tokenCount.value;

  const [tokens, prices, previousStats] = await Promise.all([
    Token.find({
      address: { $in: tokenAddresses },
    }).lean(),
    getTokenPrices(tokenAddresses, { from: dateFrom, to: dateTo }),
    getStatsForPreviousPeriod(tokenAddresses, dateFrom, dateTo),
  ]);

  return {
    tokens: buckets.map(bucket => {
      const token = tokens.find(t => t.address === bucket.key);
      const price = prices.find(t => t.tokenAddress === bucket.key);
      const prev = previousStats.find(s => s.tokenAddress === bucket.key);

      const {
        address,
        circulatingSupply,
        imageUrl,
        name,
        symbol,
        totalSupply,
        type,
      } = token;

      const closePrice = _.get(price, 'priceUSD', null);
      const marketCap =
        totalSupply === null || closePrice === null
          ? null
          : totalSupply * closePrice;

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
          fillCount: bucket.fillCount.value,
          fillCountChange: getPercentageChange(
            prev.fillCount,
            bucket.fillCount.value,
          ),
          fillVolume: {
            token: bucket.fillVolume.value,
            USD: bucket.fillVolumeUSD.value,
          },
          fillVolumeChange: {
            token: getPercentageChange(
              prev.fillVolume.token,
              bucket.fillVolume.value,
            ),
            USD: getPercentageChange(
              prev.fillVolume.USD,
              bucket.fillVolumeUSD.value,
            ),
          },
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
        totalSupply: _.isFinite(totalSupply) ? totalSupply : null,
        type,
      };
    }),
    resultCount: tokenCount,
  };
};

module.exports = getTokensWithStatsForDates;
