const _ = require('lodash');
const moment = require('moment');

const AddressMetric = require('../model/address-metric');

const compute24HourTraderStats = async () => {
  const dateTo = moment.utc().toDate();
  const dateFrom = moment
    .utc(dateTo)
    .subtract(24, 'hours')
    .toDate();

  const results = await AddressMetric.aggregate([
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
      $facet: {
        maker: [
          {
            $match: {
              'hours.minutes.fillCount.maker': {
                $gt: 0,
              },
            },
          },
          {
            $group: {
              _id: '$address',
            },
          },
          {
            $count: 'count',
          },
        ],
        taker: [
          {
            $match: {
              'hours.minutes.fillCount.taker': {
                $gt: 0,
              },
            },
          },
          {
            $group: {
              _id: '$address',
            },
          },
          {
            $count: 'count',
          },
        ],
        trader: [
          {
            $group: {
              _id: '$address',
            },
          },
          {
            $count: 'count',
          },
        ],
      },
    },
    {
      $project: {
        makerCount: {
          $arrayElemAt: ['$maker.count', 0],
        },
        takerCount: {
          $arrayElemAt: ['$taker.count', 0],
        },
        traderCount: {
          $arrayElemAt: ['$trader.count', 0],
        },
      },
    },
  ]);

  return {
    makerCount: _.get(results, '0.makerCount', 0),
    takerCount: _.get(results, '0.takerCount', 0),
    traderCount: _.get(results, '0.traderCount', 0),
  };
};

module.exports = compute24HourTraderStats;
