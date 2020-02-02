const _ = require('lodash');
const moment = require('moment');

const { GRANULARITY } = require('../constants');
const elasticsearch = require('../util/elasticsearch');

const getProtocolMetrics = async (dateFrom, dateTo, granularity) => {
  const dayFrom = moment
    .utc(dateFrom)
    .startOf('day')
    .toDate();
  const dayTo = moment
    .utc(dateTo)
    .endOf('day')
    .toDate();
  const hourFrom = moment
    .utc(dateFrom)
    .startOf('hour')
    .toDate();
  const hourTo = moment
    .utc(dateTo)
    .endOf('hour')
    .toDate();

  const query =
    granularity === GRANULARITY.DAY
      ? {
          bool: {
            must: [
              {
                range: {
                  date: {
                    from: dayFrom.toISOString(),
                    to: dayTo.toISOString(),
                  },
                },
              },
            ],
          },
        }
      : {
          bool: {
            must: [
              {
                range: {
                  date: {
                    from: hourFrom.toISOString(),
                    to: hourTo.toISOString(),
                  },
                },
              },
            ],
          },
        };

  const results = await elasticsearch.getClient().search({
    index: 'fills',
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
                fillVolume: {
                  sum: { field: 'value' },
                },
              },
            },
          },
        },
      },
      size: 0,
      query,
    },
  });

  const dataPoints = _(results.body.aggregations.stats_by_protocol.buckets)
    .map(x => {
      const protocolVersion = x.key;
      const stats = x.stats_by_date.buckets.map(y => ({
        protocolVersion,
        date: y.key_as_string,
        fillCount: y.doc_count,
        fillVolume: y.fillVolume.value,
      }));

      return stats;
    })
    .flatten();

  return _(dataPoints)
    .groupBy('date')
    .map((stats, date) => ({
      date: new Date(date).toISOString(),
      stats: stats.map(stat => ({
        fillCount: stat.fillCount,
        fillVolume: stat.fillVolume,
        protocolVersion: stat.protocolVersion,
      })),
    }))
    .sortBy('date');
};

module.exports = getProtocolMetrics;
