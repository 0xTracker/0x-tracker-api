const _ = require('lodash');

const AddressMetric = require('../model/address-metric');
const getRelayerTakerAddresses = require('../relayers/get-relayer-taker-addresses');

const computeTraderStatsForDates = async (dateFrom, dateTo) => {
  const relayerTakerAddresses = await getRelayerTakerAddresses();
  const results = await AddressMetric.aggregate([
    {
      $match: {
        address: { $nin: relayerTakerAddresses },
        date: {
          $gte: dateFrom,
          $lte: dateTo,
        },
      },
    },
    {
      $facet: {
        maker: [
          {
            $match: {
              'fillCount.maker': {
                $gt: 0,
              },
            },
          },
          {
            $group: {
              _id: '$address',
            },
          },
          {
            $count: 'count',
          },
        ],
        taker: [
          {
            $match: {
              'fillCount.taker': {
                $gt: 0,
              },
            },
          },
          {
            $group: {
              _id: '$address',
            },
          },
          {
            $count: 'count',
          },
        ],
        trader: [
          {
            $group: {
              _id: '$address',
            },
          },
          {
            $count: 'count',
          },
        ],
      },
    },
    {
      $project: {
        makerCount: {
          $arrayElemAt: ['$maker.count', 0],
        },
        takerCount: {
          $arrayElemAt: ['$taker.count', 0],
        },
        traderCount: {
          $arrayElemAt: ['$trader.count', 0],
        },
      },
    },
  ]);

  return {
    makerCount: _.get(results, '0.makerCount', 0),
    takerCount: _.get(results, '0.takerCount', 0),
    traderCount: _.get(results, '0.traderCount', 0),
  };
};

module.exports = computeTraderStatsForDates;
