const elasticsearch = require('../util/elasticsearch');
const getDatesForMetrics = require('../util/get-dates-for-metrics');

const getAssetBridgeMetrics = async (bridgeAddress, period, granularity) => {
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
            {
              term: {
                'assets.bridgeAddress': bridgeAddress,
              },
            },
          ],
        },
      },
    },
  });

  return results.body.aggregations.metrics_by_date.buckets.map(x => ({
    date: new Date(x.key_as_string),
    tradeCount: x.tradeCount.value,
    tradeVolume: x.tradeVolume.value,
  }));
};

module.exports = getAssetBridgeMetrics;
