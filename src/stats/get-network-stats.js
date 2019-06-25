const _ = require('lodash');
const moment = require('moment');

const RelayerMetric = require('../model/relayer-metric');

const getNetworkStats = async (dateFrom, dateTo) => {
  const dayFrom = moment
    .utc(dateFrom)
    .startOf('day')
    .toDate();
  const dayTo = moment
    .utc(dateTo)
    .endOf('day')
    .toDate();
  const results = await RelayerMetric.aggregate([
    {
      $match: {
        date: {
          $gte: dayFrom,
          $lte: dayTo,
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
        _id: null,
        feesUSD: {
          $sum: '$hours.minutes.fees.USD',
        },
        feesZRX: {
          $sum: '$hours.minutes.fees.ZRX',
        },
        fillCount: {
          $sum: '$hours.minutes.fillCount',
        },
        fillVolume: {
          $sum: '$hours.minutes.fillVolume',
        },
        tradeCount: {
          $sum: '$hours.minutes.tradeCount',
        },
        tradeVolume: {
          $sum: '$hours.minutes.tradeVolume',
        },
      },
    },
  ]);

  if (results.length === 0) {
    return {
      fees: {
        USD: 0,
        ZRX: 0,
      },
      fills: 0,
      volume: 0,
    };
  }

  return {
    fees: {
      USD: _.get(results, '0.feesUSD'),
      ZRX: _.get(results, '0.feesZRX'),
    },
    fillCount: _.get(results, '0.fillCount'),
    fillVolume: _.get(results, '0.fillVolume'),
    tradeCount: _.get(results, '0.tradeCount'),
    tradeVolume: _.get(results, '0.tradeVolume'),
  };
};

module.exports = getNetworkStats;
