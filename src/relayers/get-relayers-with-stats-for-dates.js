const _ = require('lodash');

const RelayerMetric = require('../model/relayer-metric');

const getRelayersWithStatsForDates = async (dateFrom, dateTo, options) => {
  const { page, limit } = _.defaults({}, options, {
    page: 1,
    limit: 20,
  });

  const result = await RelayerMetric.aggregate([
    {
      $match: {
        date: {
          $gte: dateFrom,
          $lte: dateTo,
        },
        relayerId: { $ne: null },
      },
    },
    {
      $group: {
        _id: '$relayerId',
        fillCount: {
          $sum: '$fillCount',
        },
        fillVolume: {
          $sum: '$fillVolume',
        },
        tradeCount: {
          $sum: '$tradeCount',
        },
        tradeVolume: {
          $sum: '$tradeVolume',
        },
      },
    },
    {
      $facet: {
        relayers: [
          { $sort: { tradeVolume: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $lookup: {
              from: 'relayers',
              localField: '_id',
              foreignField: 'lookupId',
              as: 'relayer',
            },
          },
          {
            $project: {
              _id: 0,
              imageUrl: { $arrayElemAt: ['$relayer.imageUrl', 0] },
              name: { $arrayElemAt: ['$relayer.name', 0] },
              slug: { $arrayElemAt: ['$relayer.slug', 0] },
              stats: {
                fillCount: '$fillCount',
                fillVolume: '$fillVolume',
                tradeCount: '$tradeCount',
                tradeVolume: '$tradeVolume',
              },
              url: { $arrayElemAt: ['$relayer.url', 0] },
            },
          },
        ],
        resultCount: [{ $count: 'value' }],
      },
    },
  ]);

  return {
    relayers: result[0].relayers,
    resultCount: result[0].resultCount[0].value,
  };
};

module.exports = getRelayersWithStatsForDates;
