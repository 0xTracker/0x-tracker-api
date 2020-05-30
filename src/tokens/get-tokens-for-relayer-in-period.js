const _ = require('lodash');

const elasticsearch = require('../util/elasticsearch');
const getCdnTokenImageUrl = require('./get-cdn-token-image-url');
const getDatesForPeriod = require('../util/get-dates-for-time-period');
const Token = require('../model/token');

const getElasticsearchOrderByKey = sortBy => {
  if (sortBy === 'fillCount') {
    return '_count';
  }

  return sortBy;
};

const getRelayersForTokenInPeriod = async (relayerId, period, options) => {
  const { limit, page, sortBy } = options;
  const { dateFrom, dateTo } = getDatesForPeriod(period);

  const startIndex = (page - 1) * limit;

  const response = await elasticsearch.getClient().search({
    index: 'traded_tokens',
    body: {
      query: {
        bool: {
          filter: [
            {
              range: {
                date: {
                  gte: dateFrom,
                  lte: dateTo,
                },
              },
            },
            {
              term: {
                relayerId,
              },
            },
          ],
        },
      },
      aggs: {
        stats_by_token: {
          terms: {
            field: 'tokenAddress',
            missing: -1,
            size: limit * page,
            order: { [getElasticsearchOrderByKey(sortBy)]: 'desc' },
          },
          aggs: {
            fillVolume: {
              sum: {
                field: 'filledAmount',
              },
            },
            fillVolumeUSD: {
              sum: {
                field: 'filledAmountUSD',
              },
            },
            tradeCount: {
              sum: {
                field: 'tradeCountContribution',
              },
            },
            tradeVolume: {
              sum: {
                field: 'tradedAmount',
              },
            },
            tradeVolumeUSD: {
              sum: {
                field: 'tradedAmountUSD',
              },
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
    },
  });

  const { buckets } = response.body.aggregations.stats_by_token;
  const tokenAddresses = buckets.map(bucket => bucket.key);
  const tokens = await Token.find({ address: { $in: tokenAddresses } }).lean();
  const tokenCount = response.body.aggregations.tokenCount.value;

  const tokensWithStats = buckets.map(bucket => {
    const token = tokens.find(t => t.address === bucket.key);
    const imageUrl = _.get(token, 'imageUrl', null);

    return {
      address: bucket.key,
      imageUrl: imageUrl !== null ? getCdnTokenImageUrl(imageUrl) : null,
      name: _.get(token, 'name', 'Unknown'),
      stats: {
        fillCount: bucket.doc_count,
        fillVolume: {
          token: bucket.fillVolume.value,
          USD: bucket.fillVolumeUSD.value,
        },
        tradeCount: bucket.tradeCount.value,
        tradeVolume: {
          token: bucket.tradeVolume.value,
          USD: bucket.tradeVolumeUSD.value,
        },
      },
      symbol: _.get(token, 'symbol', 'unknown'),
    };
  });

  return {
    tokens: tokensWithStats,
    resultCount: tokenCount,
  };
};

module.exports = getRelayersForTokenInPeriod;
