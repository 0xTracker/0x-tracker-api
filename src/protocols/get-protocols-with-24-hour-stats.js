const _ = require('lodash');
const moment = require('moment');

const ProtocolMetric = require('../model/protocol-metric');

const getProtocolsWith24HourStats = async options => {
  const { page, limit, sortBy } = _.defaults({}, options, {
    page: 1,
    limit: 20,
    sortBy: 'fillVolume',
  });

  const dateTo = moment.utc().toDate();
  const dateFrom = moment
    .utc(dateTo)
    .subtract(24, 'hours')
    .toDate();

  const baseQuery = {
    date: {
      $gte: moment
        .utc(dateFrom)
        .startOf('day')
        .toDate(),
      $lte: dateTo,
    },
  };

  const basePipeline = [
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
  ];

  const result = await ProtocolMetric.aggregate([
    {
      $match: baseQuery,
    },
    ...basePipeline,
    {
      $group: {
        _id: '$protocolVersion',
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
        protocols: [
          { $sort: { [sortBy]: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              _id: 0,
              stats: {
                fillCount: '$fillCount',
                fillVolume: '$fillVolume',
              },
              version: '$_id',
            },
          },
        ],
        resultCount: [{ $count: 'value' }],
      },
    },
  ]);

  return {
    protocols: _.get(result, '[0].protocols', []),
    resultCount: _.get(result, '[0].resultCount[0].value', 0),
  };
};

module.exports = getProtocolsWith24HourStats;
