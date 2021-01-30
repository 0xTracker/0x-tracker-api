const _ = require('lodash');

const elasticsearch = require('../util/elasticsearch');
const getDatesForMetrics = require('../util/get-dates-for-metrics');

const getProtocolMetrics = async (period, granularity) => {
  const { dateFrom, dateTo } = getDatesForMetrics(period, granularity);

  const results = await elasticsearch.getClient().search({
    index: granularity === 'hour' ? 'fills' : 'protocol_metrics_daily',
    body: {
      aggs: {
        stats_by_protocol: {
          terms: {
            field: 'protocolVersion',
          },
          aggs: {
            stats_by_date: {
              date_histogram: {
                field: 'date',
                calendar_interval: granularity,
                extended_bounds: {
                  min: dateFrom,
                  max: dateTo,
                },
              },
              aggs: {
                tradeCount: {
                  sum: {
                    field:
                      granularity === 'hour'
                        ? 'tradeCountContribution'
                        : 'tradeCount',
                  },
                },
                tradeVolume: {
                  sum: { field: 'tradeVolume' },
                },
              },
            },
          },
        },
      },
      size: 0,
      query: {
        bool: {
          must: [
            {
              range: {
                date: {
                  from: dateFrom,
                  to: dateTo,
                },
              },
            },
          ],
        },
      },
    },
  });

  return _(results.body.aggregations.stats_by_protocol.buckets)
    .map(x => {
      const protocolVersion = x.key;
      const stats = x.stats_by_date.buckets.map(y => ({
        protocolVersion,
        date: y.key_as_string,
        tradeCount: y.tradeCount.value,
        tradeVolume: y.tradeVolume.value,
      }));

      return stats;
    })
    .flatten()
    .groupBy('date')
    .map((stats, date) => ({
      date: new Date(date).toISOString(),
      stats: stats.map(stat => ({
        protocolVersion: stat.protocolVersion,
        tradeCount: stat.tradeCount,
        tradeVolume: stat.tradeVolume,
      })),
    }))
    .sortBy('date');
};

module.exports = getProtocolMetrics;
