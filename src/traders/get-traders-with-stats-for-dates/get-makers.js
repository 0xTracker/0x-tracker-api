const elasticsearch = require('../../util/elasticsearch');

const getSecondary = async (addresses, dateFrom, dateTo) => {
  const response = await elasticsearch.getClient().search({
    index: 'trader_fills',
    body: {
      aggs: {
        traders: {
          terms: {
            field: 'address',
            size: addresses.length,
          },
          aggs: {
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
    takerFillCount: bucket.takerFills.value,
    takerFillVolume: bucket.takerFillVolume.value,
    takerTradeCount: bucket.takerTrades.value,
    takerTradeVolume: bucket.takerTradeVolume.value,
    totalFillCount: bucket.totalFills.value,
    totalFillVolume: bucket.totalFillVolume.value,
    totalTradeCount: bucket.totalTrades.value,
    totalTradeVolume: bucket.totalTradeVolume.value,
  }));

  return traders;
};

const getPrimary = async (dateFrom, dateTo, { exclude, limit, page }) => {
  const startIndex = (page - 1) * limit;
  const response = await elasticsearch.getClient().search({
    index: 'trader_fills',
    body: {
      aggs: {
        traders: {
          terms: {
            field: 'address',
            order: { makerTradeVolume: 'desc' },
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
                makerFillCount: {
                  gt: 0,
                },
              },
            },
          ],
          must_not: {
            terms: {
              address: exclude,
            },
          },
        },
      },
    },
  });

  const { aggregations } = response.body;
  const traderCount = aggregations.traderCount.value;
  const { buckets } = aggregations.traders;

  const traders = buckets.map(bucket => ({
    address: bucket.key,
    makerFillCount: bucket.makerFills.value,
    makerFillVolume: bucket.makerFillVolume.value,
    makerTradeCount: bucket.makerTrades.value,
    makerTradeVolume: bucket.makerTradeVolume.value,
  }));

  return {
    traders,
    resultCount: traderCount,
  };
};

const getMakers = async (dateFrom, dateTo, { exclude, limit, page }) => {
  const primaryData = await getPrimary(dateFrom, dateTo, {
    exclude,
    limit,
    page,
  });

  const makerAddresses = primaryData.traders.map(maker => maker.address);
  const secondaryData = await getSecondary(makerAddresses, dateFrom, dateTo);
  const makers = primaryData.traders.map(trader => {
    const secondaryStats = secondaryData.find(
      dataPoint => dataPoint.address === trader.address,
    );

    return {
      address: trader.address,
      stats: {
        fillCount: {
          maker: trader.makerFillCount,
          taker: secondaryStats.takerFillCount,
          total: secondaryStats.totalFillCount,
        },
        fillVolume: {
          maker: trader.makerFillVolume,
          taker: secondaryStats.takerFillVolume,
          total: secondaryStats.totalFillVolume,
        },
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
