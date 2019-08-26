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
        totals: [
          {
            $group: {
              _id: null,
              relayerCount: { $sum: 1 },
              tradeVolume: { $sum: '$tradeVolume' },
            },
          },
        ],
      },
    },
  ]);

  const totalVolume = _.get(result, '[0].totals[0].tradeVolume', 0);

  return {
    relayers: _.get(result, '[0].relayers', []).map(relayer => ({
      ...relayer,
      stats: {
        ...relayer.stats,
        tradeVolumeShare: (relayer.stats.tradeVolume / totalVolume) * 100,
      },
    })),
    resultCount: _.get(result, '[0].totals[0].relayerCount', 0),
  };
};

module.exports = getRelayersWithStatsForDates;
