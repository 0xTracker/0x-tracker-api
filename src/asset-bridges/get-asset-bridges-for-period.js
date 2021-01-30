const _ = require('lodash');

const AssetBridge = require('../model/asset-bridge');
const elasticsearch = require('../util/elasticsearch');
const getDatesForTimePeriod = require('../util/get-dates-for-time-period');

const getBridgesForPeriod = async (period, options) => {
  const { limit, page } = options;
  const { dateFrom, dateTo } = getDatesForTimePeriod(period);
  const startIndex = (page - 1) * limit;

  const response = await elasticsearch.getClient().search({
    index: 'fills',
    body: {
      aggs: {
        assetBridges: {
          terms: {
            field: 'assets.bridgeAddress',
            size: limit * page,
          },
          aggs: {
            tradeCount: {
              sum: {
                field: 'tradeCountContribution',
              },
            },
            tradeVolume: {
              sum: {
                field: 'tradeVolume',
              },
            },
            bucket_truncate: {
              bucket_sort: {
                size: limit,
                from: startIndex,
                sort: [
                  {
                    tradeVolume: { order: 'desc' },
                  },
                ],
              },
            },
          },
        },
        bridgeCount: {
          cardinality: {
            field: 'assets.bridgeAddress',
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
                tradeCountContribution: { gt: 0 },
              },
            },
          ],
        },
      },
    },
  });

  const bridgeCount = response.body.aggregations.bridgeCount.value;
  const bridgeBuckets = response.body.aggregations.assetBridges.buckets;
  const bridgeAddresses = bridgeBuckets.map(bucket => bucket.key);
  const assetBridges = await AssetBridge.find({
    address: { $in: bridgeAddresses },
  }).lean();

  const bridgesWithStats = bridgeBuckets.map(bucket => {
    const assetBridge = assetBridges.find(b => b.address === bucket.key);

    return {
      address: bucket.key,
      imageUrl: _.get(assetBridge, 'imageUrl', null),
      name: _.get(assetBridge, 'name', null),
      stats: {
        tradeCount: bucket.tradeCount.value,
        tradeVolume: bucket.tradeVolume.value,
      },
    };
  });

  return {
    assetBridges: bridgesWithStats,
    resultCount: bridgeCount,
  };
};

module.exports = getBridgesForPeriod;
