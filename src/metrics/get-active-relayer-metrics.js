const elasticsearch = require('../util/elasticsearch');
const getDatesForMetrics = require('../util/get-dates-for-metrics');

const getActiveRelayerMetrics = async (period, granularity) => {
  const { dateFrom, dateTo } = getDatesForMetrics(period, granularity);

  const results = await elasticsearch.getClient().search({
    body: {
      query: {
        bool: {
          filter: [
            {
              range: {
                date: {
                  gte: dateFrom,
                  lte: dateTo,
                },
              },
            },
            { exists: { field: 'relayerId' } },
          ],
        },
      },
      aggs: {
        metrics_by_date: {
          date_histogram: {
            field: 'date',
            calendar_interval: granularity,
            extended_bounds: {
              min: dateFrom,
              max: dateTo,
            },
          },
          aggs: {
            relayerCount: {
              cardinality: {
                field: 'relayerId',
              },
            },
          },
        },
      },
    },
    index: 'fills',
    size: 0,
  });

  return results.body.aggregations.metrics_by_date.buckets.map(x => ({
    activeRelayers: x.relayerCount.value,
    date: new Date(x.key_as_string),
  }));
};

module.exports = getActiveRelayerMetrics;
