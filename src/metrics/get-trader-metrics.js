const elasticsearch = require('../util/elasticsearch');
const getDatesForMetrics = require('../util/get-dates-for-metrics');

const getTraderMetrics = async (address, period, granularity) => {
  const { dateFrom, dateTo } = getDatesForMetrics(period, granularity);

  const results = await elasticsearch.getClient().search({
    index: granularity === 'hour' ? 'trader_fills' : 'trader_metrics_daily',
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
                  [granularity === 'hour'
                    ? 'makerTradeCount'
                    : 'makerTrades']: {
                    gt: 0,
                  },
                },
              },
              aggs: {
                tradeCount: {
                  sum: {
                    field:
                      granularity === 'hour'
                        ? 'totalTradeCount'
                        : 'makerTrades',
                  },
                },
                tradeVolume: {
                  sum: {
                    field:
                      granularity === 'hour'
                        ? 'totalTradeValue'
                        : 'makerTradeVolume',
                  },
                },
              },
            },
            taker: {
              filter: {
                range: {
                  [granularity === 'hour'
                    ? 'takerTradeCount'
                    : 'takerTrades']: {
                    gt: 0,
                  },
                },
              },
              aggs: {
                tradeCount: {
                  sum: {
                    field:
                      granularity === 'hour'
                        ? 'totalTradeCount'
                        : 'takerTrades',
                  },
                },
                tradeVolume: {
                  sum: {
                    field:
                      granularity === 'hour'
                        ? 'totalTradeValue'
                        : 'takerTradeVolume',
                  },
                },
              },
            },
            tradeCount: {
              sum: {
                field:
                  granularity === 'hour' ? 'totalTradeCount' : 'totalTrades',
              },
            },
            tradeVolume: {
              sum: {
                field:
                  granularity === 'hour'
                    ? 'totalTradeValue'
                    : 'totalTradeVolume',
              },
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
