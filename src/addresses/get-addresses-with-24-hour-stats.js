const _ = require('lodash');
const moment = require('moment');

const AddressMetric = require('../model/address-metric');
const getRelayers = require('../relayers/get-relayers');

const getAddressesWith24HourStats = async options => {
  const { excludeRelayers, page, limit } = _.defaults({}, options, {
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

  const result = await AddressMetric.aggregate([
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
        fillCount: {
          $ifNull: [
            '$hours.minutes.fillCount.total',
            '$hours.minutes.fillCount',
          ],
        },
        fillVolume: {
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
        fillCount: {
          $sum: '$fillCount',
        },
        fillVolume: {
          $sum: '$fillVolume',
        },
      },
    },
    {
      $facet: {
        addresses: [
          { $sort: { fillVolume: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              _id: 0,
              address: '$_id',
              stats: {
                fillCount: '$fillCount',
                fillVolume: '$fillVolume',
              },
            },
          },
        ],
        resultCount: [{ $count: 'value' }],
      },
    },
  ]);

  return {
    addresses: _.get(result, '[0].addresses', []),
    resultCount: _.get(result, '[0].resultCount[0].value', 0),
  };
};

module.exports = getAddressesWith24HourStats;
