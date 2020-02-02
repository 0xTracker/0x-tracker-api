const _ = require('lodash');
const moment = require('moment');

const { GRANULARITY } = require('../constants');
const formatTokenAmount = require('../tokens/format-token-amount');
const TokenMetric = require('../model/token-metric');

const getTokenMetrics = async (token, dateFrom, dateTo, granularity) => {
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
    granularity === GRANULARITY.DAY
      ? [
          {
            $match: {
              date: { $gte: dayFrom, $lte: dayTo },
              tokenAddress: token.address,
            },
          },
          { $sort: { date: 1 } },
        ]
      : [
          {
            $match: {
              date: { $gte: dayFrom, $lte: dayTo },
              tokenAddress: token.address,
            },
          },
          {
            $unwind: {
              path: '$hours',
            },
          },
          {
            $project: {
              hour: '$hours.date',
              fillCount: '$hours.fillCount',
              tokenVolume: '$hours.tokenVolume',
              usdVolume: '$hours.usdVolume',
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
              tokenVolume: {
                $sum: '$tokenVolume',
              },
              usdVolume: {
                $sum: '$usdVolume',
              },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ];

  const dataPoints = await TokenMetric.aggregate(pipeline);

  const result = dataPoints.map(dataPoint => {
    return {
      date: _.get(dataPoint, 'date', dataPoint._id),
      fillCount: dataPoint.fillCount,
      fillVolume: {
        token: formatTokenAmount(dataPoint.tokenVolume, token),
        USD: dataPoint.usdVolume,
      },
    };
  });

  return result;
};

module.exports = getTokenMetrics;
