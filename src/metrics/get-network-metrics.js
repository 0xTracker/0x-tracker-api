const _ = require('lodash');
const moment = require('moment');

const { METRIC_INTERVAL, ZRX_TOKEN_ADDRESS } = require('../constants');
const { getToken } = require('../tokens/token-cache');
const formatTokenAmount = require('../tokens/format-token-amount');
const RelayerMetric = require('../model/relayer-metric');

const getNetworkMetrics = async (
  dateFrom,
  dateTo,
  metricInterval,
  filter = {},
) => {
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
      $match: _.merge(
        { date: { $gte: dayFrom, $lte: dayTo } },
        ..._.compact([
          _.isNumber(filter.relayerId) && { relayerId: filter.relayerId },
        ]),
      ),
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
        fees: {
          USD: '$hours.fees.USD',
          ZRX: '$hours.fees.ZRX',
        },
        fillCount: '$hours.fillCount',
        fillVolume: '$hours.fillVolume',
        tradeCount: '$hours.tradeCount',
        tradeVolume: '$hours.tradeVolume',
      },
    },
    metricInterval === METRIC_INTERVAL.HOUR
      ? {
          $match: { hour: { $gte: hourFrom, $lte: hourTo } },
        }
      : { $match: { hour: { $gte: dayFrom, $lte: dayTo } } },
    {
      $group: {
        _id: metricInterval === METRIC_INTERVAL.HOUR ? '$hour' : '$day',
        feesUSD: {
          $sum: '$fees.USD',
        },
        feesZRX: {
          $sum: '$fees.ZRX',
        },
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
      $sort: {
        _id: 1,
      },
    },
  ]);

  const dataPoints = await RelayerMetric.aggregate(pipeline);
  const zrxToken = getToken(ZRX_TOKEN_ADDRESS);

  if (zrxToken === undefined) {
    throw new Error('Cannot find ZRX token');
  }

  const result = dataPoints.map(dataPoint => {
    return {
      date: dataPoint._id,
      fees: {
        USD: dataPoint.feesUSD,
        ZRX: formatTokenAmount(dataPoint.feesZRX, zrxToken),
      },
      fillCount: dataPoint.fillCount,
      fillVolume: dataPoint.fillVolume,
      tradeCount: dataPoint.tradeCount,
      tradeVolume: dataPoint.tradeVolume,
    };
  });

  return result;
};

module.exports = getNetworkMetrics;
