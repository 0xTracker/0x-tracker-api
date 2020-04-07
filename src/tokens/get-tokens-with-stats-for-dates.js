const _ = require('lodash');

const elasticsearch = require('../util/elasticsearch');
const Token = require('../model/token');

const nullifyValueIfZero = value => (value === 0 ? null : value);

const getTokensWithStatsForDates = async (dateFrom, dateTo, options) => {
  console.log(dateFrom, dateTo);
  const { page, limit, type } = _.defaults({}, options, {
    page: 1,
    limit: 20,
  });

  const startIndex = (page - 1) * limit;

  const res = await elasticsearch.getClient().search({
    index: 'traded_tokens',
    body: {
      aggs: {
        tokenStats: {
          terms: {
            field: 'tokenAddress',
            order: { tradeVolumeUSD: 'desc' },
            size: page * limit,
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
                size: limit,
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
            type === undefined ? undefined : { term: { tokenType: type } },
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

  const tokens = await Token.find({
    address: { $in: tokenAddresses },
  }).lean();

  return {
    tokens: tokenStats.map(stats => {
      const token = tokens.find(t => t.address === stats.key);

      return {
        ..._.pick(token, ['address', 'imageUrl', 'name', 'symbol', 'type']),
        lastTrade: _.get(token, 'price.lastTrade', null),
        price: {
          last: _.get(token, 'price.lastPrice', null),
        },
        stats: {
          fillCount: stats.fillCount.value,
          fillVolume: {
            token: nullifyValueIfZero(stats.fillVolume.value),
            USD: nullifyValueIfZero(stats.fillVolumeUSD.value),
          },
          tradeCount: stats.tradeCount.value,
          tradeVolume: {
            token: nullifyValueIfZero(stats.tradeVolume.value),
            USD: nullifyValueIfZero(stats.tradeVolumeUSD.value),
          },
        },
      };
    }),
    resultCount: tokenCount,
  };
};

module.exports = getTokensWithStatsForDates;
