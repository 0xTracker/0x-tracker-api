const _ = require('lodash');
const moment = require('moment');

const AddressMetric = require('../model/address-metric');
const getRelayers = require('../relayers/get-relayers');

const getTradersWith24HourStats = async options => {
  const { excludeRelayers, page, limit, type } = _.defaults({}, options, {
    excludeRelayers: true,
    page: 1,
    limit: 20,
  });

  const dateTo = moment.utc().toDate();
  const dateFrom = moment
    .utc(dateTo)
    .subtract(24, 'hours')
    .toDate();

  const relayers = await getRelayers();

  const relayerTakerAddresses = _(relayers)
    .map(relayer => relayer.takerAddresses)
    .flatten()
    .compact()
    .value();

  const result = await AddressMetric.aggregate(
    _.compact([
      {
        $match: _.pickBy(
          {
            address: excludeRelayers
              ? { $nin: relayerTakerAddresses }
              : undefined,
            date: {
              $gte: moment
                .utc(dateFrom)
                .startOf('day')
                .toDate(),
              $lte: dateTo,
            },
          },
          value => value !== undefined,
        ),
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
        $project: {
          address: 1,
          fillCountMaker: '$hours.minutes.fillCount.maker',
          fillCountTaker: '$hours.minutes.fillCount.taker',
          fillCountTotal: {
            $ifNull: [
              '$hours.minutes.fillCount.total',
              '$hours.minutes.fillCount',
            ],
          },
          fillVolumeMaker: '$hours.minutes.fillVolume.maker',
          fillVolumeTaker: '$hours.minutes.fillVolume.taker',
          fillVolumeTotal: {
            $ifNull: [
              '$hours.minutes.fillVolume.total',
              '$hours.minutes.fillVolume',
            ],
          },
        },
      },
      {
        $group: {
          _id: '$address',
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
      type !== undefined
        ? {
            $match:
              type === 'maker'
                ? { fillCountMaker: { $gte: 1 } }
                : { fillCountTaker: { $gte: 1 } },
          }
        : null,
      {
        $facet: {
          addresses: [
            { $sort: { fillVolumeTotal: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                address: '$_id',
                stats: {
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
            },
          ],
          resultCount: [{ $count: 'value' }],
        },
      },
    ]),
  );

  return {
    traders: _.get(result, '[0].addresses', []),
    resultCount: _.get(result, '[0].resultCount[0].value', 0),
  };
};

module.exports = getTradersWith24HourStats;
