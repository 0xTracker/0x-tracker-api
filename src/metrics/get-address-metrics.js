const _ = require('lodash');
const moment = require('moment');

const { METRIC_INTERVAL } = require('../constants');
const AddressMetric = require('../model/address-metric');

const getAddressMetrics = async (address, dateFrom, dateTo, metricInterval) => {
  const dayFrom = moment
    .utc(dateFrom)
    .startOf('day')
    .toDate();
  const dayTo = moment
    .utc(dateTo)
    .endOf('day')
    .toDate();
  const hourFrom = moment
    .utc(dateFrom)
    .startOf('hour')
    .toDate();
  const hourTo = moment
    .utc(dateTo)
    .endOf('hour')
    .toDate();

  const pipeline =
    metricInterval === METRIC_INTERVAL.DAY
      ? [
          {
            $match: { date: { $gte: dayFrom, $lte: dayTo }, address },
          },
          { $sort: { date: 1 } },
        ]
      : [
          {
            $match: { date: { $gte: dayFrom, $lte: dayTo }, address },
          },
          {
            $unwind: {
              path: '$hours',
            },
          },
          {
            $project: {
              hour: '$hours.date',
              fillCount: {
                $ifNull: ['$hours.fillCount.total', '$hours.fillCount'],
              },
              fillVolume: {
                $ifNull: ['$hours.fillVolume.total', '$hours.fillVolume'],
              },
            },
          },
          {
            $match: { hour: { $gte: hourFrom, $lte: hourTo } },
          },
          {
            $group: {
              _id: '$hour',
              fillCount: {
                $sum: '$fillCount',
              },
              fillVolume: {
                $sum: '$fillVolume',
              },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ];

  const dataPoints = await AddressMetric.aggregate(pipeline);

  const result = dataPoints.map(dataPoint => {
    return {
      date: _.get(dataPoint, 'date', dataPoint._id),
      fillCount: dataPoint.fillCount,
      fillVolume: {
        USD: dataPoint.fillVolume,
      },
    };
  });

  return result;
};

module.exports = getAddressMetrics;
