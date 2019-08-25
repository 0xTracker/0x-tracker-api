const _ = require('lodash');

const AddressMetric = require('../model/address-metric');
const getRelayers = require('../relayers/get-relayers');

const getAddressesWithStatsForDates = async (dateFrom, dateTo, options) => {
  const { excludeRelayers, page, limit } = _.defaults({}, options, {
    excludeRelayers: true,
    page: 1,
    limit: 20,
  });

  const relayers = await getRelayers();

  const relayerTakerAddresses = _(relayers)
    .map(relayer => relayer.takerAddresses)
    .flatten()
    .compact()
    .value();

  const result = await AddressMetric.aggregate([
    {
      $match: _.pickBy(
        {
          address: excludeRelayers
            ? { $nin: relayerTakerAddresses }
            : undefined,
          date: {
            $gte: dateFrom,
            $lte: dateTo,
          },
        },
        value => value !== undefined,
      ),
    },
    {
      $group: {
        _id: '$address',
        fillCount: {
          $sum: '$fillCount',
        },
        fillVolume: {
          $sum: '$fillVolume',
        },
      },
    },
    {
      $facet: {
        addresses: [
          { $sort: { fillVolume: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              _id: 0,
              address: '$_id',
              stats: {
                fillCount: '$fillCount',
                fillVolume: '$fillVolume',
              },
            },
          },
        ],
        resultCount: [{ $count: 'value' }],
      },
    },
  ]);

  return {
    addresses: result[0].addresses,
    resultCount: result[0].resultCount[0].value,
  };
};

module.exports = getAddressesWithStatsForDates;
