const elasticsearch = require('../util/elasticsearch');
const getDatesForMetrics = require('../util/get-dates-for-metrics');

const getTraderMetrics = async (address, period, granularity) => {
  const { dateFrom, dateTo } = getDatesForMetrics(period, granularity);

  const results = await elasticsearch.getClient().search({
    index: 'trader_fills',
    body: {
      aggs: {
        metrics: {
          date_histogram: {
            field: 'date',
            calendar_interval: granularity,
            extended_bounds: {
              min: dateFrom,
              max: dateTo,
            },
          },
          aggs: {
            maker: {
              filter: {
                range: {
                  makerFillCount: {
                    gt: 0,
                  },
                },
              },
              aggs: {
                fillCount: {
                  sum: { field: 'totalFillCount' },
                },
                fillVolume: {
                  sum: { field: 'totalFillValue' },
                },
                tradeCount: {
                  sum: { field: 'totalTradeCount' },
                },
                tradeVolume: {
                  sum: { field: 'totalTradeValue' },
                },
              },
            },
            taker: {
              filter: {
                range: {
                  takerFillCount: {
                    gt: 0,
                  },
                },
              },
              aggs: {
                fillCount: {
                  sum: { field: 'totalFillCount' },
                },
                fillVolume: {
                  sum: { field: 'totalFillValue' },
                },
                tradeCount: {
                  sum: { field: 'totalTradeCount' },
                },
                tradeVolume: {
                  sum: { field: 'totalTradeValue' },
                },
              },
            },
            fillCount: {
              sum: { field: 'totalFillCount' },
            },
            fillVolume: {
              sum: { field: 'totalFillValue' },
            },
            tradeCount: {
              sum: { field: 'totalTradeCount' },
            },
            tradeVolume: {
              sum: { field: 'totalTradeValue' },
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
                address,
              },
            },
          ],
        },
      },
    },
  });

  return results.body.aggregations.metrics.buckets.map(bucket => ({
    date: new Date(bucket.key_as_string),
    fillCount: {
      maker: bucket.maker.fillCount.value,
      taker: bucket.taker.fillCount.value,
      total: bucket.fillCount.value,
    },
    fillVolume: {
      maker: bucket.maker.fillVolume.value,
      taker: bucket.taker.fillVolume.value,
      total: bucket.fillVolume.value,
    },
    tradeCount: {
      maker: bucket.maker.tradeCount.value,
      taker: bucket.taker.tradeCount.value,
      total: bucket.tradeCount.value,
    },
    tradeVolume: {
      maker: bucket.maker.tradeVolume.value,
      taker: bucket.taker.tradeVolume.value,
      total: bucket.tradeVolume.value,
    },
  }));
};

module.exports = getTraderMetrics;
