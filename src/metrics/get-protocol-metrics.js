const _ = require('lodash');

const elasticsearch = require('../util/elasticsearch');

const getProtocolMetrics = async (dateFrom, dateTo, granularity) => {
  const results = await elasticsearch.getClient().search({
    index: 'protocol_metrics_hourly',
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
        fillCount: y.fillCount.value,
        fillVolume: y.fillVolume.value,
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
        fillCount: stat.fillCount,
        fillVolume: stat.fillVolume,
        protocolVersion: stat.protocolVersion,
        tradeCount: stat.tradeCount,
        tradeVolume: stat.tradeVolume,
      })),
    }))
    .sortBy('date');
};

module.exports = getProtocolMetrics;
