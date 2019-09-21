const _ = require('lodash');

const { TRADER_TYPE } = require('../constants');
const AddressMetric = require('../model/address-metric');
const getRelayers = require('../relayers/get-relayers');

const getTradersWithStatsForDates = async (dateFrom, dateTo, options) => {
  const { excludeRelayers, page, limit, type } = _.defaults({}, options, {
    excludeRelayers: true,
    page: 1,
    limit: 20,
  });

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
              $gte: dateFrom,
              $lte: dateTo,
            },
          },
          value => value !== undefined,
        ),
      },
      {
        $project: {
          address: 1,
          fillCountMaker: '$fillCount.maker',
          fillCountTaker: '$fillCount.taker',
          fillCountTotal: {
            $ifNull: ['$fillCount.total', '$fillCount'],
          },
          fillVolumeMaker: '$fillVolume.maker',
          fillVolumeTaker: '$fillVolume.taker',
          fillVolumeTotal: {
            $ifNull: ['$fillVolume.total', '$fillVolume'],
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
              type === TRADER_TYPE.MAKER
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
    traders: result[0].addresses,
    resultCount: result[0].resultCount[0].value,
  };
};

module.exports = getTradersWithStatsForDates;
