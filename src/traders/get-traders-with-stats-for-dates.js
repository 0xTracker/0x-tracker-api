const _ = require('lodash');

const AddressMetric = require('../model/address-metric');
const getRelayerTakerAddresses = require('../relayers/get-relayer-taker-addresses');

const getSortKey = orderBy =>
  ({
    'fillVolume.maker': 'fillVolumeMaker',
    'fillVolume.taker': 'fillVolumeTaker',
    'fillVolume.total': 'fillVolumeTotal',
  }[orderBy]);

const getTradersWithStatsForDates = async (dateFrom, dateTo, options) => {
  const { excludeRelayers, sortBy, page, limit, type } = _.defaults(
    {},
    options,
    {
      excludeRelayers: true,
      sortBy: 'fillVolume.total',
      page: 1,
      limit: 20,
    },
  );

  const relayerTakerAddresses = await getRelayerTakerAddresses();
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
              type === 'maker'
                ? { fillCountMaker: { $gte: 1 } }
                : { fillCountTaker: { $gte: 1 } },
          }
        : null,
      {
        $facet: {
          addresses: [
            { $sort: { [getSortKey(sortBy)]: -1 } },
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
    traders: _.get(result, '0.addresses', []),
    resultCount: _.get(result, '0.resultCount.0.value', 0),
  };
};

module.exports = getTradersWithStatsForDates;
