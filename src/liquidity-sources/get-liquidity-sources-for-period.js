const _ = require('lodash');
const { TIME_PERIOD } = require('../constants');
const AttributionEntity = require('../model/attribution-entity');
const elasticsearch = require('../util/elasticsearch');
const getDatesForTimePeriod = require('../util/get-dates-for-time-period');
const getPercentageChange = require('../util/get-percentage-change');
const getPreviousPeriod = require('../util/get-previous-period');

const getPreviousStats = async (sourceIds, period) => {
  if (sourceIds.length === 0) {
    return [];
  }

  const usePrecomputed = period === 'day';
  const { dateFrom, dateTo } = getDatesForTimePeriod(period);
  const { prevDateFrom, prevDateTo } = getPreviousPeriod(dateFrom, dateTo);

  const response = await elasticsearch.getClient().search({
    index: usePrecomputed ? 'liquidity_source_metrics_daily' : 'fills',
    body: {
      aggs: {
        liquiditySources: {
          terms: {
            field: 'liquiditySourceId',
            size: sourceIds.length,
          },
          aggs: {
            tradeCount: {
              sum: {
                field: usePrecomputed ? 'tradeCount' : 'tradeCountContribution',
              },
            },
            tradeVolume: {
              sum: {
                field: 'tradeVolume',
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
                  gte: prevDateFrom,
                  lte: prevDateTo,
                },
              },
            },
            {
              terms: {
                liquiditySourceId: sourceIds,
              },
            },
          ],
        },
      },
    },
  });

  return response.body.aggregations.liquiditySources.buckets.map(bucket => ({
    id: bucket.key,
    avgTradeSize: bucket.tradeVolume.value / bucket.tradeCount.value,
    tradeCount: bucket.tradeCount.value,
    tradeVolume: bucket.tradeVolume.value,
  }));
};

const getLiquiditySourcesForPeriod = async (period, options) => {
  const { limit, page } = options;
  const { dateFrom, dateTo } = getDatesForTimePeriod(period);
  const usePrecomputed = period === TIME_PERIOD.DAY;
  const startIndex = (page - 1) * limit;

  const response = await elasticsearch.getClient().search({
    index: usePrecomputed ? 'liquidity_source_metrics_daily' : 'fills',
    body: {
      aggs: {
        liquiditySources: {
          terms: {
            field: 'liquiditySourceId',
            size: limit * page,
            order: {
              tradeVolume: 'desc',
            },
          },
          aggs: {
            tradeCount: {
              sum: {
                field: usePrecomputed ? 'tradeCount' : 'tradeCountContribution',
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
              },
            },
          },
        },
        totalCount: {
          cardinality: {
            field: 'liquiditySourceId',
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
          ],
        },
      },
    },
  });

  const totalCount = response.body.aggregations.totalCount.value;
  const sourceBuckets = response.body.aggregations.liquiditySources.buckets;
  const ids = sourceBuckets.map(bucket => bucket.key);
  const [attributionEntities, previousStats] = await Promise.all([
    AttributionEntity.find({
      _id: { $in: ids },
    }).lean(),
    getPreviousStats(ids, period),
  ]);

  const liquiditySourcesWithStats = sourceBuckets.map(bucket => {
    const attributionEntity = attributionEntities.find(
      b => b._id === bucket.key,
    );

    const prevStat = previousStats.find(s => s.id === bucket.key);
    const prevAvgTradeSize = _.get(prevStat, 'avgTradeSize', null);
    const prevTradeCount = _.get(prevStat, 'tradeCount', null);
    const prevTradeVolume = _.get(prevStat, 'tradeVolume', null);

    const tradeCount = bucket.tradeCount.value;
    const tradeVolume = bucket.tradeVolume.value;
    const avgTradeSize = tradeVolume / tradeCount;

    return {
      categories: attributionEntity.categories,
      description: _.get(attributionEntity, 'description', null),
      id: attributionEntity._id,
      logoUrl: _.get(attributionEntity, 'logoUrl', null),
      name: attributionEntity.name,
      stats: {
        avgTradeSize,
        avgTradeSizeChange: getPercentageChange(prevAvgTradeSize, avgTradeSize),
        tradeCount,
        tradeCountChange: getPercentageChange(prevTradeCount, tradeCount),
        tradeVolume,
        tradeVolumeChange: getPercentageChange(prevTradeVolume, tradeVolume),
      },
      urlSlug: attributionEntity.urlSlug,
      websiteUrl: _.get(attributionEntity, 'websiteUrl', null),
    };
  });

  return {
    liquiditySources: liquiditySourcesWithStats,
    resultCount: totalCount,
  };
};

module.exports = getLiquiditySourcesForPeriod;
