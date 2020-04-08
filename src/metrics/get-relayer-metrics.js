const elasticsearch = require('../util/elasticsearch');
const getDatesForMetrics = require('../util/get-dates-for-metrics');

const getRelayerMetrics = async (relayerId, period, granularity) => {
  const { dateFrom, dateTo } = getDatesForMetrics(period, granularity);

  const results = await elasticsearch.getClient().search({
    index: 'fills',
    body: {
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
          must_not: [
            relayerId === null
              ? {
                  exists: {
                    field: 'relayerId',
                  },
                }
              : undefined,
          ].filter(x => x !== undefined),
        },
      },
    },
  });

  return results.body.aggregations.metrics_by_date.buckets.map(x => ({
    date: new Date(x.key_as_string),
    fillCount: x.doc_count,
    fillVolume: x.fillVolume.value,
    tradeCount: relayerId === null ? x.doc_count : x.tradeCount.value,
    tradeVolume: relayerId === null ? x.fillVolume.value : x.tradeVolume.value,
  }));
};

module.exports = getRelayerMetrics;
