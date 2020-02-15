const _ = require('lodash');

const elasticsearch = require('../util/elasticsearch');

const getProtocolsWithStatsForDates = async (dateFrom, dateTo, options) => {
  const { page, limit, sortBy } = _.defaults({}, options, {
    page: 1,
    limit: 20,
    sortBy: 'fillVolume',
  });

  const response = await elasticsearch.getClient().search({
    index: 'protocol_metrics_hourly',
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
              sum: { field: 'fillCount' },
            },
            fillVolume: {
              sum: { field: 'fillVolume' },
            },
            tradeCount: {
              sum: { field: 'tradeCount' },
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

module.exports = getProtocolsWithStatsForDates;
