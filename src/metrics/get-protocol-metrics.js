const _ = require('lodash');
const moment = require('moment');

const { METRIC_INTERVAL } = require('../constants');
const ProtocolVersionMetric = require('../model/protocol-version-metric');

const getProtocolVersionMetrics = async (dateFrom, dateTo, metricInterval) => {
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

  const pipeline = _.compact([
    {
      $match: { date: { $gte: dayFrom, $lte: dayTo } },
    },
    {
      $unwind: {
        path: '$hours',
      },
    },
    {
      $project: {
        day: '$date',
        hour: '$hours.date',
        fillCount: '$hours.fillCount',
        fillVolume: '$hours.fillVolume',
        protocolVersion: 1,
      },
    },
    metricInterval === METRIC_INTERVAL.HOUR
      ? {
          $match: { hour: { $gte: hourFrom, $lte: hourTo } },
        }
      : { $match: { hour: { $gte: dayFrom, $lte: dayTo } } },
    {
      $group: {
        _id: {
          date: metricInterval === METRIC_INTERVAL.HOUR ? '$hour' : '$day',
          protocolVersion: '$protocolVersion',
        },
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
        '_id.date': 1,
      },
    },
  ]);

  const results = await ProtocolVersionMetric.aggregate(pipeline);

  const dataPoints = _(results).map(dataPoint => {
    return {
      date: dataPoint._id.date,
      fillCount: dataPoint.fillCount,
      fillVolume: dataPoint.fillVolume,
      protocolVersion: dataPoint._id.protocolVersion,
    };
  });

  return dataPoints;
};

module.exports = getProtocolVersionMetrics;
