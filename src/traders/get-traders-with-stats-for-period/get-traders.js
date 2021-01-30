const elasticsearch = require('../../util/elasticsearch');

const getQuery = (dateFrom, dateTo, appIds) => {
  return {
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
        appIds === undefined
          ? undefined
          : {
              terms: {
                appIds,
              },
            },
      ].filter(x => x !== undefined),
    },
  };
};

const getTraders = async (
  dateFrom,
  dateTo,
  { appIds, limit, page, usePrecomputed },
) => {
  const startIndex = (page - 1) * limit;
  const response = await elasticsearch.getClient().search({
    index: usePrecomputed ? 'trader_metrics_daily' : 'trader_fills',
    body: {
      aggs: {
        traders: {
          terms: {
            field: 'address',
            order: { totalTradeVolume: 'desc' },
            size: page * limit,
          },
          aggs: {
            makerTrades: {
              sum: {
                field: usePrecomputed ? 'makerTrades' : 'makerTradeCount',
              },
            },
            makerTradeVolume: {
              sum: {
                field: usePrecomputed ? 'makerTradeVolume' : 'makerTradeValue',
              },
            },
            takerTrades: {
              sum: {
                field: usePrecomputed ? 'takerTrades' : 'takerTradeCount',
              },
            },
            takerTradeVolume: {
              sum: {
                field: usePrecomputed ? 'takerTradeVolume' : 'takerTradeValue',
              },
            },
            totalTrades: {
              sum: {
                field: usePrecomputed ? 'totalTrades' : 'totalTradeCount',
              },
            },
            totalTradeVolume: {
              sum: {
                field: usePrecomputed ? 'totalTradeVolume' : 'totalTradeValue',
              },
            },
            bucket_truncate: {
              bucket_sort: {
                size: limit,
                from: startIndex,
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
      size: 0,
      query: getQuery(dateFrom, dateTo, appIds),
    },
  });

  const { aggregations } = response.body;
  const traderCount = aggregations.traderCount.value;
  const { buckets } = aggregations.traders;

  const traders = buckets.map(bucket => ({
    address: bucket.key,
    stats: {
      tradeCount: {
        maker: bucket.makerTrades.value,
        taker: bucket.takerTrades.value,
        total: bucket.totalTrades.value,
      },
      tradeVolume: {
        maker: bucket.makerTradeVolume.value,
        taker: bucket.takerTradeVolume.value,
        total: bucket.totalTradeVolume.value,
      },
    },
  }));

  return {
    traders,
    resultCount: traderCount,
  };
};

module.exports = getTraders;
