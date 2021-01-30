const elasticsearch = require('../../util/elasticsearch');

const getSecondary = async (addresses, dateFrom, dateTo, usePrecomputed) => {
  const response = await elasticsearch.getClient().search({
    index: usePrecomputed ? 'trader_metrics_daily' : 'trader_fills',
    body: {
      aggs: {
        traders: {
          terms: {
            field: 'address',
            size: addresses.length,
          },
          aggs: {
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
              terms: {
                address: addresses,
              },
            },
          ],
        },
      },
    },
  });

  const { aggregations } = response.body;
  const { buckets } = aggregations.traders;

  const traders = buckets.map(bucket => ({
    address: bucket.key,
    takerTradeCount: bucket.takerTrades.value,
    takerTradeVolume: bucket.takerTradeVolume.value,
    totalTradeCount: bucket.totalTrades.value,
    totalTradeVolume: bucket.totalTradeVolume.value,
  }));

  return traders;
};

const getPrimary = async (dateFrom, dateTo, options) => {
  const { limit, page, usePrecomputed } = options;

  const response = await elasticsearch.getClient().search({
    index: usePrecomputed ? 'trader_metrics_daily' : 'trader_fills',
    body: {
      aggs: {
        traders: {
          terms: {
            field: 'address',
            order: { makerTradeVolume: 'desc' },
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
            bucket_truncate: {
              bucket_sort: {
                size: limit,
                from: (page - 1) * limit,
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
              range: {
                [usePrecomputed ? 'makerTrades' : 'makerTradeCount']: {
                  gt: 0,
                },
              },
            },
          ],
        },
      },
    },
  });

  const { aggregations } = response.body;
  const traderCount = aggregations.traderCount.value;
  const { buckets } = aggregations.traders;

  const traders = buckets.map(bucket => ({
    address: bucket.key,
    makerTradeCount: bucket.makerTrades.value,
    makerTradeVolume: bucket.makerTradeVolume.value,
  }));

  return {
    traders,
    resultCount: traderCount,
  };
};

const getMakers = async (dateFrom, dateTo, options) => {
  const primaryData = await getPrimary(dateFrom, dateTo, options);

  const secondaryData = await getSecondary(
    primaryData.traders.map(maker => maker.address),
    dateFrom,
    dateTo,
    options.usePrecomputed,
  );

  const makers = primaryData.traders.map(trader => {
    const secondaryStats = secondaryData.find(
      dataPoint => dataPoint.address === trader.address,
    );

    return {
      address: trader.address,
      stats: {
        tradeCount: {
          maker: trader.makerTradeCount,
          taker: secondaryStats.takerTradeCount,
          total: secondaryStats.totalTradeCount,
        },
        tradeVolume: {
          maker: trader.makerTradeVolume,
          taker: secondaryStats.takerTradeVolume,
          total: secondaryStats.totalTradeVolume,
        },
      },
    };
  });

  return {
    traders: makers,
    resultCount: primaryData.resultCount,
  };
};

module.exports = getMakers;
