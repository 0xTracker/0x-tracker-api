const elasticsearch = require('../util/elasticsearch');
const getDatesForMetrics = require('../util/get-dates-for-metrics');

const getAppMetrics = async (appId, period, granularity) => {
  const { dateFrom, dateTo } = getDatesForMetrics(period, granularity);

  const results = await elasticsearch.getClient().search({
    index: 'app_fill_attributions',
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
            relayedTrades: {
              sum: { field: 'relayedTrades' },
            },
            relayedVolume: {
              sum: { field: 'relayedVolume' },
            },
            sourcedTrades: {
              sum: { field: 'sourcedTrades' },
            },
            sourcedVolume: {
              sum: { field: 'sourcedVolume' },
            },
            totalTrades: {
              sum: { field: 'totalTrades' },
            },
            totalVolume: {
              sum: { field: 'totalVolume' },
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
            {
              term: {
                appId,
              },
            },
          ],
        },
      },
    },
  });

  return results.body.aggregations.metrics_by_date.buckets.map(x => ({
    date: new Date(x.key_as_string),
    relayedTrades: x.relayedTrades.value,
    relayedVolume: x.relayedVolume.value,
    sourcedTrades: x.sourcedTrades.value,
    sourcedVolume: x.sourcedVolume.value,
    totalTrades: x.totalTrades.value,
    totalVolume: x.totalVolume.value,
  }));
};

module.exports = getAppMetrics;
