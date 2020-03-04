const _ = require('lodash');

const { GRANULARITY } = require('../constants');
const formatTokenAmount = require('../tokens/format-token-amount');
const getDatesForMetrics = require('../util/get-dates-for-metrics');
const padMetrics = require('./pad-metrics');
const TokenMetric = require('../model/token-metric');

const getTokenMetrics = async (token, period, granularity) => {
  const { dateFrom, dateTo } = getDatesForMetrics(period, granularity);

  const pipeline =
    granularity === GRANULARITY.DAY || granularity === GRANULARITY.WEEK
      ? [
          {
            $match: {
              date: { $gte: dateFrom, $lte: dateTo },
              tokenAddress: token.address,
            },
          },
          { $sort: { date: 1 } },
        ]
      : [
          {
            $match: {
              date: { $gte: dateFrom, $lte: dateTo },
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
            $match: { hour: { $gte: dateFrom, $lte: dateTo } },
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

  const result = padMetrics(
    dataPoints.map(dataPoint => {
      return {
        date: _.get(dataPoint, 'date', dataPoint._id),
        fillCount: dataPoint.fillCount,
        fillVolume: {
          token: formatTokenAmount(dataPoint.tokenVolume, token),
          USD: dataPoint.usdVolume,
        },
      };
    }),
    period,
    granularity,
    { fillCount: 0, fillVolume: { token: '0', USD: 0 } },
  );

  return result;
};

module.exports = getTokenMetrics;
