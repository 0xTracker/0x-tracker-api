const elasticsearch = require('../../util/elasticsearch');

const getQuery = (dateFrom, dateTo, exclude, appIds) => {
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
      must_not: {
        terms: {
          address: exclude,
        },
      },
    },
  };
};

const getTraders = async (
  dateFrom,
  dateTo,
  { appIds, exclude, limit, page },
) => {
  const startIndex = (page - 1) * limit;
  const response = await elasticsearch.getClient().search({
    index: 'trader_fills',
    body: {
      aggs: {
        traders: {
          terms: {
            field: 'address',
            order: { totalTradeVolume: 'desc' },
            size: page * limit,
          },
          aggs: {
            makerFills: {
              sum: { field: 'makerFillCount' },
            },
            makerFillVolume: {
              sum: { field: 'makerFillValue' },
            },
            makerTrades: {
              sum: { field: 'makerTradeCount' },
            },
            makerTradeVolume: {
              sum: { field: 'makerTradeValue' },
            },
            takerFills: {
              sum: { field: 'takerFillCount' },
            },
            takerFillVolume: {
              sum: { field: 'takerFillValue' },
            },
            takerTrades: {
              sum: { field: 'takerTradeCount' },
            },
            takerTradeVolume: {
              sum: { field: 'takerTradeValue' },
            },
            totalFills: {
              sum: { field: 'totalFillCount' },
            },
            totalFillVolume: {
              sum: { field: 'totalFillValue' },
            },
            totalTrades: {
              sum: { field: 'totalTradeCount' },
            },
            totalTradeVolume: {
              sum: { field: 'totalTradeValue' },
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
      query: getQuery(dateFrom, dateTo, exclude, appIds),
    },
  });

  const { aggregations } = response.body;
  const traderCount = aggregations.traderCount.value;
  const { buckets } = aggregations.traders;

  const traders = buckets.map(bucket => ({
    address: bucket.key,
    stats: {
      fillCount: {
        maker: bucket.makerFills.value,
        taker: bucket.takerFills.value,
        total: bucket.totalFills.value,
      },
      fillVolume: {
        maker: bucket.makerFillVolume.value,
        taker: bucket.takerFillVolume.value,
        total: bucket.totalFillVolume.value,
      },
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
