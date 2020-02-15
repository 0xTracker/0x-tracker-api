const _ = require('lodash');
const moment = require('moment');

const elasticsearch = require('../util/elasticsearch');

const getProtocolsWith24HourStats = async options => {
  const { page, limit, sortBy } = _.defaults({}, options, {
    page: 1,
    limit: 20,
    sortBy: 'fillVolume',
  });

  const dateTo = moment.utc().toDate();
  const dateFrom = moment
    .utc(dateTo)
    .subtract(24, 'hours')
    .toDate();

  const response = await elasticsearch.getClient().search({
    index: 'fills',
    body: {
      aggs: {
        stats_by_protocol: {
          terms: {
            field: 'protocolVersion',
            order: { [sortBy]: 'desc' },
            size: 10,
          },
          aggs: {
            fillCount: {
              value_count: { field: '_id' },
            },
            fillVolume: {
              sum: { field: 'value' },
            },
            tradeCount: {
              sum: { field: 'tradeCountContribution' },
            },
            tradeVolume: {
              sum: { field: 'tradeVolume' },
            },
          },
        },
      },
      size: 0,
      query: {
        range: {
          date: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
      },
    },
  });

  const results = response.body.aggregations.stats_by_protocol.buckets;
  const protocols = _(results)
    .drop((page - 1) * limit)
    .take(limit)
    .map(x => ({
      stats: {
        fillCount: x.fillCount.value,
        fillVolume: x.fillVolume.value,
        tradeCount: x.tradeCount.value,
        tradeVolume: x.tradeVolume.value,
      },
      version: x.key,
    }))
    .value();

  return {
    protocols,
    resultCount: results.length,
  };
};

module.exports = getProtocolsWith24HourStats;
