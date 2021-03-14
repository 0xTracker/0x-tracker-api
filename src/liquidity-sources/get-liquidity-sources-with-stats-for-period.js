const _ = require('lodash');
const AttributionEntity = require('../model/attribution-entity');
const elasticsearch = require('../util/elasticsearch');
const getDatesForTimePeriod = require('../util/get-dates-for-time-period');

const getLiquiditySourcesWithStatsForDates = async (
  dateFrom,
  dateTo,
  { limit, page, usePrecomputed },
) => {
  const startIndex = (page - 1) * limit;
  const response = await elasticsearch.getClient().search({
    index: usePrecomputed ? 'liquidity_source_metrics_daily' : 'fills',
    body: {
      aggs: {
        liquiditySources: {
          terms: {
            field: 'liquiditySourceId',
            order: { tradeVolume: 'desc' },
            size: page * limit,
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
        liquiditySourceCount: {
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

  const { aggregations } = response.body;
  const liquiditySourceCount = aggregations.liquiditySourceCount.value;
  const { buckets } = aggregations.liquiditySources;
  const entityIds = buckets.map(bucket => bucket.key);

  const attributionEntities = await AttributionEntity.find({
    _id: { $in: entityIds },
  }).lean();

  const liquiditySources = buckets.map(bucket => {
    const attributionEntity = attributionEntities.find(
      x => x._id === bucket.key,
    );

    return {
      id: bucket.key,
      logoUrl: _.get(attributionEntity, 'logoUrl', null),
      name: _.get(attributionEntity, 'name', 'Unknown'),
      stats: {
        tradeCount: bucket.tradeCount.value,
        tradeVolume: bucket.tradeVolume.value,
      },
      urlSlug: _.get(attributionEntity, 'urlSlug', bucket.key),
    };
  });

  return {
    liquiditySources,
    resultCount: liquiditySourceCount,
  };
};

const getLiquiditySourcesWithStatsForPeriod = async (period, options) => {
  const { dateFrom, dateTo } = getDatesForTimePeriod(period);
  const { page, limit } = _.defaults({}, options, {
    page: 1,
    limit: 20,
  });

  const result = await getLiquiditySourcesWithStatsForDates(dateFrom, dateTo, {
    limit,
    page,
    usePrecomputed: period !== 'day',
  });

  return result;
};

module.exports = getLiquiditySourcesWithStatsForPeriod;
