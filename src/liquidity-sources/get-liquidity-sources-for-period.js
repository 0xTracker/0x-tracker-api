const _ = require('lodash');
const AttributionEntity = require('../model/attribution-entity');
const elasticsearch = require('../util/elasticsearch');
const getDatesForTimePeriod = require('../util/get-dates-for-time-period');

const getSparklineField = (sparkline, usePrecomputed) => {
  if (sparkline === 'tradeCount') {
    return usePrecomputed ? 'tradeCount' : 'tradeCountContribution';
  }

  return 'tradeVolume';
};

const getLiquiditySourcesWithStatsForDates = async (
  dateFrom,
  dateTo,
  {
    limit,
    page,
    sortBy,
    sortDirection,
    sparkline,
    sparklineGranularity,
    usePrecomputed,
  },
) => {
  const startIndex = (page - 1) * limit;
  const response = await elasticsearch.getClient().search({
    index: usePrecomputed ? 'liquidity_source_metrics_daily' : 'fills',
    body: {
      aggs: {
        liquiditySources: {
          terms: {
            field: 'liquiditySourceId',
            order: { [sortBy]: sortDirection },
            size: page * limit,
          },
          aggs: {
            metrics:
              sparkline !== 'none'
                ? {
                    date_histogram: {
                      field: 'date',
                      calendar_interval: sparklineGranularity,
                      extended_bounds: {
                        min: dateFrom,
                        max: dateTo,
                      },
                    },
                    aggs: {
                      value: {
                        sum: {
                          field: getSparklineField(sparkline, usePrecomputed),
                        },
                      },
                    },
                  }
                : undefined,
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
      sparkline: bucket.metrics
        ? bucket.metrics.buckets.map(metricsBucket => ({
            date: metricsBucket.key_as_string,
            value: metricsBucket.value.value,
          }))
        : null,
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

const getLiquiditySourcesForPeriod = async (period, options) => {
  const { dateFrom, dateTo } = getDatesForTimePeriod(period);

  const result = await getLiquiditySourcesWithStatsForDates(dateFrom, dateTo, {
    ...options,
    usePrecomputed: period !== 'day',
  });

  return result;
};

module.exports = getLiquiditySourcesForPeriod;
