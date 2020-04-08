const elasticsearch = require('../util/elasticsearch');
const getDatesForMetrics = require('../util/get-dates-for-metrics');

const getRelayerMetrics = async (relayerId, period, granularity) => {
  const { dateFrom, dateTo } = getDatesForMetrics(period, granularity);

  const results = await elasticsearch.getClient().search({
    index:
      relayerId === null
        ? 'unknown_relayer_metrics_hourly'
        : 'relayer_metrics_hourly',
    body: {
      aggs: {
        relayer_metrics_by_day: {
          date_histogram: {
            field: 'date',
            calendar_interval: granularity,
            extended_bounds: {
              min: dateFrom,
              max: dateTo,
            },
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
            relayerId !== null
              ? {
                  term: {
                    relayerId,
                  },
                }
              : undefined,
          ].filter(x => x !== undefined),
        },
      },
    },
  });

  return results.body.aggregations.relayer_metrics_by_day.buckets.map(x => ({
    date: new Date(x.key_as_string),
    fillCount: x.fillCount.value,
    fillVolume: x.fillVolume.value,
    tradeCount: relayerId === null ? x.fillCount.value : x.tradeCount.value,
    tradeVolume: relayerId === null ? x.fillVolume.value : x.tradeVolume.value,
  }));
};

module.exports = getRelayerMetrics;
