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
    makerTradeCount: bucket.makerTrades.value,
    makerTradeVolume: bucket.makerTradeVolume.value,
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
            order: { takerTradeVolume: 'desc' },
            size: page * limit,
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
                [usePrecomputed ? 'takerTrades' : 'takerTradeCount']: {
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
    takerTradeCount: bucket.takerTrades.value,
    takerTradeVolume: bucket.takerTradeVolume.value,
  }));

  return {
    traders,
    resultCount: traderCount,
  };
};

const getTakers = async (dateFrom, dateTo, { limit, page, usePrecomputed }) => {
  const primaryData = await getPrimary(dateFrom, dateTo, {
    limit,
    page,
    usePrecomputed,
  });

  const takerAddresses = primaryData.traders.map(taker => taker.address);

  const secondaryData = await getSecondary(
    takerAddresses,
    dateFrom,
    dateTo,
    usePrecomputed,
  );

  const takers = primaryData.traders.map(taker => {
    const secondaryStats = secondaryData.find(
      dataPoint => dataPoint.address === taker.address,
    );

    return {
      address: taker.address,
      stats: {
        tradeCount: {
          maker: secondaryStats.makerTradeCount,
          taker: taker.takerTradeCount,
          total: secondaryStats.totalTradeCount,
        },
        tradeVolume: {
          maker: secondaryStats.makerTradeVolume,
          taker: taker.takerTradeVolume,
          total: secondaryStats.totalTradeVolume,
        },
      },
    };
  });

  return {
    traders: takers,
    resultCount: primaryData.resultCount,
  };
};

module.exports = getTakers;
