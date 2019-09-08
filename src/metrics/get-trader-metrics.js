const moment = require('moment');

const { METRIC_INTERVAL } = require('../constants');
const AddressMetric = require('../model/address-metric');

const getTraderMetrics = async (address, dateFrom, dateTo, metricInterval) => {
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
          {
            $project: {
              date: 1,
              fillCount: {
                maker: '$fillCount.maker',
                taker: '$fillCount.taker',
                total: { $ifNull: ['$fillCount.total', '$fillCount'] },
              },
              fillVolume: {
                maker: '$fillVolume.maker',
                taker: '$fillVolume.taker',
                total: { $ifNull: ['$fillVolume.total', '$fillVolume'] },
              },
            },
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
              fillCountMaker: '$hours.fillCount.maker',
              fillCountTaker: '$hours.fillCount.taker',
              fillCountTotal: {
                $ifNull: ['$hours.fillCount.total', '$hours.fillCount'],
              },
              fillVolumeMaker: '$hours.fillVolume.maker',
              fillVolumeTaker: '$hours.fillVolume.taker',
              fillVolumeTotal: {
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
              fillCountMaker: {
                $sum: '$fillCountMaker',
              },
              fillCountTaker: {
                $sum: '$fillCountTaker',
              },
              fillCountTotal: {
                $sum: '$fillCountTotal',
              },
              fillVolumeMaker: {
                $sum: '$fillVolumeMaker',
              },
              fillVolumeTaker: {
                $sum: '$fillVolumeTaker',
              },
              fillVolumeTotal: {
                $sum: '$fillVolumeTotal',
              },
            },
          },
          {
            $project: {
              date: '$_id',
              fillCount: {
                maker: '$fillCountMaker',
                taker: '$fillCountTaker',
                total: '$fillCountTotal',
              },
              fillVolume: {
                maker: '$fillVolumeMaker',
                taker: '$fillVolumeTaker',
                total: '$fillVolumeTotal',
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

  return dataPoints;
};

module.exports = getTraderMetrics;
