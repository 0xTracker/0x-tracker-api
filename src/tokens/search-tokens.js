const moment = require('moment');

const elasticsearch = require('../util/elasticsearch');
const Token = require('../model/token');

const getSuggestedTokens = async limit => {
  const res = await elasticsearch.getClient().search({
    index: 'token_metrics_daily',
    body: {
      aggs: {
        tokenStats: {
          terms: {
            field: 'address',
            order: { tradeVolumeUSD: 'desc' },
            size: limit,
          },
          aggs: {
            tradeVolumeUSD: {
              sum: { field: 'tradeVolumeUsd' },
            },
            bucket_truncate: {
              bucket_sort: {
                size: limit,
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
              range: {
                date: {
                  gte: moment()
                    .subtract(30, 'days')
                    .toDate(),
                },
              },
            },
          ],
        },
      },
    },
  });

  const { buckets } = res.body.aggregations.tokenStats;
  const tokenAddresses = buckets.map(x => x.key);

  const tokens = await Token.find({
    address: { $in: tokenAddresses },
  }).lean();

  return buckets.map(bucket => {
    const token = tokens.find(t => t.address === bucket.key);

    const { address, imageUrl, name, symbol, type } = token;

    return {
      address,
      imageUrl,
      name,
      symbol,
      type,
    };
  });
};

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

const searchTokens = async (query, options) => {
  if (query === '' || query === null) {
    const tokens = await getSuggestedTokens(options.limit);

    return tokens;
  }

  const tokens = await Token.find({
    $or: [
      { address: query },
      { name: new RegExp(escapeRegex(query), 'ig') },
      { symbol: new RegExp(escapeRegex(query), 'ig') },
    ],
  })
    .sort({ name: 1 })
    .limit(options.limit)
    .lean();

  return tokens;
};

module.exports = searchTokens;
