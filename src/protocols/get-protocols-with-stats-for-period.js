const _ = require('lodash');

const elasticsearch = require('../util/elasticsearch');
const getDatesForTimePeriod = require('../util/get-dates-for-time-period');

const getProtocolsWithStatsForPeriod = async (period, options) => {
  const { dateFrom, dateTo } = getDatesForTimePeriod(period);
  const { page, limit, sortBy } = _.defaults({}, options, {
    page: 1,
    limit: 20,
    sortBy: 'tradeVolume',
  });

  const response = await elasticsearch.getClient().search({
    index: period === 'day' ? 'fills' : 'protocol_metrics_daily',
    body: {
      aggs: {
        stats_by_protocol: {
          terms: {
            field: 'protocolVersion',
            order: { [sortBy]: 'desc' },
            size: page * limit,
          },
          aggs: {
            tradeCount: {
              sum: {
                field:
                  period === 'day' ? 'tradeCountContribution' : 'tradeCount',
              },
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

module.exports = getProtocolsWithStatsForPeriod;
