const _ = require('lodash');

const ProtocolMetric = require('../model/protocol-metric');

const getProtocolsWithStatsForDates = async (dateFrom, dateTo, options) => {
  const { page, limit, sortBy } = _.defaults({}, options, {
    page: 1,
    limit: 20,
    sortBy: 'fillVolume',
  });

  const result = await ProtocolMetric.aggregate(
    _.compact([
      {
        $match: {
          date: {
            $gte: dateFrom,
            $lte: dateTo,
          },
        },
      },
      {
        $group: {
          _id: '$protocolVersion',
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
          protocols: [
            { $sort: { [sortBy]: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                stats: {
                  fillCount: '$fillCount',
                  fillVolume: '$fillVolume',
                },
                version: '$_id',
              },
            },
          ],
          resultCount: [{ $count: 'value' }],
        },
      },
    ]),
  );

  return {
    protocols: _.get(result, '0.protocols', []),
    resultCount: _.get(result, '0.resultCount.0.value', 0),
  };
};

module.exports = getProtocolsWithStatsForDates;
