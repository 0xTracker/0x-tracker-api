const _ = require('lodash');

const formatTokenAmount = require('./format-token-amount');
const TokenMetric = require('../model/token-metric');

const getTokensWithStatsForDates = async (dateFrom, dateTo, options) => {
  const { page, limit, type } = _.defaults({}, options, {
    page: 1,
    limit: 20,
  });

  const result = await TokenMetric.aggregate(
    _.compact([
      {
        $match: {
          date: {
            $gte: dateFrom,
            $lte: dateTo,
          },
        },
      },
      {
        $group: {
          _id: '$tokenAddress',
          fillCount: {
            $sum: '$fillCount',
          },
          tokenVolume: {
            $sum: '$tokenVolume',
          },
          usdVolume: {
            $sum: '$usdVolume',
          },
        },
      },
      {
        $lookup: {
          from: 'tokens',
          localField: '_id',
          foreignField: 'address',
          as: 'token',
        },
      },
      type === undefined
        ? null
        : {
            $match: {
              'token.0.type': type,
            },
          },
      {
        $facet: {
          tokens: [
            { $sort: { usdVolume: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                address: { $arrayElemAt: ['$token.address', 0] },
                decimals: { $arrayElemAt: ['$token.decimals', 0] },
                imageUrl: { $arrayElemAt: ['$token.imageUrl', 0] },
                lastTrade: { $arrayElemAt: ['$token.price.lastTrade', 0] },
                name: { $arrayElemAt: ['$token.name', 0] },
                price: {
                  last: { $arrayElemAt: ['$token.price.lastPrice', 0] },
                },
                symbol: { $arrayElemAt: ['$token.symbol', 0] },
                stats: {
                  fillCount: '$fillCount',
                  fillVolume: {
                    token: '$tokenVolume',
                    USD: '$usdVolume',
                  },
                },
                type: { $arrayElemAt: ['$token.type', 0] },
                url: { $arrayElemAt: ['$token.url', 0] },
              },
            },
          ],
          resultCount: [{ $count: 'value' }],
          totals: [
            {
              $group: {
                _id: null,
                tokenCount: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]),
  );

  return {
    tokens: _.get(result, '[0].tokens', []).map(token => ({
      ..._.pick(token, [
        'address',
        'imageUrl',
        'lastTrade',
        'name',
        'price',
        'symbol',
        'type',
      ]),
      stats: {
        ...token.stats,
        fillVolume: {
          ...token.stats.fillVolume,
          token: formatTokenAmount(
            token.stats.fillVolume.token,
            token.decimals,
          ),
        },
      },
    })),
    resultCount: _.get(result, '[0].totals[0].tokenCount', 0),
  };
};

module.exports = getTokensWithStatsForDates;
