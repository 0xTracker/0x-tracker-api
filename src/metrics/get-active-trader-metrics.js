const elasticsearch = require('../util/elasticsearch');
const getDatesForMetrics = require('../util/get-dates-for-metrics');

const getActiveTraderMetrics = async (period, granularity) => {
  const { dateFrom, dateTo } = getDatesForMetrics(period, granularity);

  if (granularity === 'hour') {
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
              makers: {
                filter: {
                  range: {
                    makerTradeCount: {
                      gt: 0,
                    },
                  },
                },
                aggs: {
                  makerCount: {
                    cardinality: {
                      field: 'address',
                    },
                  },
                },
              },
              takers: {
                filter: {
                  range: {
                    takerTradeCount: {
                      gt: 0,
                    },
                  },
                },
                aggs: {
                  takerCount: {
                    cardinality: {
                      field: 'address',
                    },
                  },
                },
              },
              traderCount: {
                cardinality: {
                  field: 'address',
                },
              },
            },
          },
        },
      },
      index: 'trader_fills',
      size: 0,
    });

    return results.body.aggregations.metrics_by_date.buckets.map(x => ({
      date: new Date(x.key_as_string),
      makerCount: x.makers.makerCount.value,
      takerCount: x.takers.takerCount.value,
      traderCount: x.traderCount.value,
    }));
  }

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
            makers: {
              filter: {
                range: {
                  makerTrades: {
                    gt: 0,
                  },
                },
              },
              aggs: {
                makerCount: {
                  cardinality: {
                    field: 'address',
                  },
                },
              },
            },
            takers: {
              filter: {
                range: {
                  takerTrades: {
                    gt: 0,
                  },
                },
              },
              aggs: {
                takerCount: {
                  cardinality: {
                    field: 'address',
                  },
                },
              },
            },
            traderCount: {
              cardinality: {
                field: 'address',
              },
            },
          },
        },
      },
    },
    index: 'trader_metrics_daily',
    size: 0,
  });

  return results.body.aggregations.metrics_by_date.buckets.map(x => ({
    date: new Date(x.key_as_string),
    makerCount: x.makers.makerCount.value,
    takerCount: x.takers.takerCount.value,
    traderCount: x.traderCount.value,
  }));
};

module.exports = getActiveTraderMetrics;
