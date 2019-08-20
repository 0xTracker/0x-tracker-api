const AddressMetric = require('../model/address-metric');

const getAddressesWithStatsForDates = async (
  dateFrom,
  dateTo,
  { page, pageSize } = { page: 1, pageSize: 20 },
) => {
  const baseQuery = {
    date: {
      $gte: dateFrom,
      $lte: dateTo,
    },
  };

  const result = await AddressMetric.aggregate([
    {
      $match: baseQuery,
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
          { $skip: (page - 1) * pageSize },
          { $limit: pageSize },
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
