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

  const baseQuery = {
    date: {
      $gte: dayFrom,
      $lte: dayTo,
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

  const [fillResults, tradeResults] = await Promise.all([
    RelayerMetric.aggregate([
      {
        $match: baseQuery,
      },
      ...basePipeline,
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
        },
      },
    ]),

    RelayerMetric.aggregate([
      {
        $match: {
          ...baseQuery,
          relayerId: { $ne: null },
        },
      },
      ...basePipeline,
      {
        $group: {
          _id: null,
          tradeCount: {
            $sum: '$hours.minutes.tradeCount',
          },
          tradeVolume: {
            $sum: '$hours.minutes.tradeVolume',
          },
        },
      },
    ]),
  ]);

  return {
    fees: {
      USD: _.get(fillResults, '0.feesUSD', 0),
      ZRX: _.get(fillResults, '0.feesZRX', 0),
    },
    fillCount: _.get(fillResults, '0.fillCount', 0),
    fillVolume: _.get(fillResults, '0.fillVolume', 0),
    tradeCount: _.get(tradeResults, '0.tradeCount', 0),
    tradeVolume: _.get(tradeResults, '0.tradeVolume', 0),
  };
};

module.exports = getNetworkStats;
