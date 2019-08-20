const moment = require('moment');

const AddressMetric = require('../model/address-metric');

const getAddressesWith24HourStats = async (
  { page, pageSize } = { page: 1, pageSize: 20 },
) => {
  const dateTo = moment.utc().toDate();
  const dateFrom = moment
    .utc(dateTo)
    .subtract(24, 'hours')
    .toDate();

  const result = await AddressMetric.aggregate([
    {
      $match: {
        date: {
          $gte: moment
            .utc(dateFrom)
            .startOf('day')
            .toDate(),
          $lte: dateTo,
        },
      },
    },
    {
      $unwind: {
        path: '$hours',
      },
    },
    {
      $unwind: {
        path: '$hours.minutes',
      },
    },
    {
      $match: {
        'hours.minutes.date': {
          $gte: dateFrom,
          $lte: dateTo,
        },
      },
    },
    {
      $group: {
        _id: '$address',
        fillCount: {
          $sum: '$hours.minutes.fillCount',
        },
        fillVolume: {
          $sum: '$hours.minutes.fillVolume',
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

module.exports = getAddressesWith24HourStats;
