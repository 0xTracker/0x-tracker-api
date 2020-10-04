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
    makerFillCount: bucket.makerFills.value,
    makerFillVolume: bucket.makerFillVolume.value,
    makerTradeCount: bucket.makerTrades.value,
    makerTradeVolume: bucket.makerTradeVolume.value,
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
            order: { takerTradeVolume: 'desc' },
            size: page * limit,
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
                takerFillCount: {
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
    takerFillCount: bucket.takerFills.value,
    takerFillVolume: bucket.takerFillVolume.value,
    takerTradeCount: bucket.takerTrades.value,
    takerTradeVolume: bucket.takerTradeVolume.value,
  }));

  return {
    traders,
    resultCount: traderCount,
  };
};

const getTakers = async (dateFrom, dateTo, { exclude, limit, page }) => {
  const primaryData = await getPrimary(dateFrom, dateTo, {
    exclude,
    limit,
    page,
  });

  const takerAddresses = primaryData.traders.map(taker => taker.address);
  const secondaryData = await getSecondary(takerAddresses, dateFrom, dateTo);
  const takers = primaryData.traders.map(taker => {
    const secondaryStats = secondaryData.find(
      dataPoint => dataPoint.address === taker.address,
    );

    return {
      address: taker.address,
      stats: {
        fillCount: {
          maker: secondaryStats.makerFillCount,
          taker: taker.takerFillCount,
          total: secondaryStats.totalFillCount,
        },
        fillVolume: {
          maker: secondaryStats.makerFillVolume,
          taker: taker.takerFillVolume,
          total: secondaryStats.totalFillVolume,
        },
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
