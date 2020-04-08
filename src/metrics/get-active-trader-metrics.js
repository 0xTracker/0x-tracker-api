const elasticsearch = require('../util/elasticsearch');
const getDatesForMetrics = require('../util/get-dates-for-metrics');

const getActiveTraderMetrics = async (period, granularity) => {
  const { dateFrom, dateTo } = getDatesForMetrics(period, granularity);

  const results = await elasticsearch.getClient().search({
    body: {
      query: {
        range: {
          date: {
            gte: dateFrom,
            lte: dateTo,
          },
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
            makerCount: {
              cardinality: {
                field: 'maker',
              },
            },
            takerCount: {
              cardinality: {
                field: 'taker',
              },
            },
            traderCount: {
              cardinality: {
                field: 'traders',
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
    date: new Date(x.key_as_string),
    makerCount: x.makerCount.value,
    takerCount: x.takerCount.value,
    traderCount: x.traderCount.value,
  }));
};

module.exports = getActiveTraderMetrics;
