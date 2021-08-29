const _ = require('lodash');
const { GRANULARITY } = require('../constants');

const elasticsearch = require('../util/elasticsearch');
const getDatesForMetrics = require('../util/get-dates-for-metrics');

const getBasicMetrics = async (appId, dates, granularity) => {
  const usePrecomputed = granularity !== GRANULARITY.HOUR;

  const results = await elasticsearch.getClient().search({
    index: usePrecomputed ? 'app_metrics_daily' : 'app_fills',
    body: {
      aggs: {
        by_date: {
          date_histogram: {
            field: 'date',
            calendar_interval: granularity,
            extended_bounds: {
              min: dates.dateFrom,
              max: dates.dateTo,
            },
          },
          aggs: {
            relayedTradeCount: {
              sum: {
                field: 'relayedTradeCount',
              },
            },
            relayedTradeVolume: {
              sum: {
                field: 'relayedTradeValue',
              },
            },
            totalTradeCount: {
              sum: {
                field: 'totalTradeCount',
              },
            },
            totalTradeVolume: {
              sum: {
                field: 'totalTradeValue',
              },
            },
          },
        },
      },
      query: {
        bool: {
          filter: [
            {
              range: {
                date: {
                  gte: dates.dateFrom,
                  lte: dates.dateTo,
                },
              },
            },
            {
              term: {
                appId,
              },
            },
          ],
        },
      },
      size: 0,
    },
  });

  return results.body.aggregations.by_date.buckets.map(bucket => {
    return {
      date: new Date(bucket.key_as_string),
      tradeCount: {
        relayed: _.get(bucket, 'relayedTradeCount.value', 0),
        total: _.get(bucket, 'totalTradeCount.value', 0),
      },
      tradeVolume: {
        relayed: _.get(bucket, 'relayedTradeVolume.value', 0),
        total: _.get(bucket, 'totalTradeVolume.value', 0),
      },
    };
  });
};

const getActiveTraderMetrics = async (appId, dates, granularity) => {
  const results = await elasticsearch.getClient().search({
    index: 'app_fills',
    body: {
      aggs: {
        by_date: {
          date_histogram: {
            field: 'date',
            calendar_interval: granularity,
            extended_bounds: {
              min: dates.dateFrom,
              max: dates.dateTo,
            },
          },
          aggs: {
            traderCount: {
              cardinality: {
                field: 'traders',
              },
            },
          },
        },
      },
      query: {
        bool: {
          filter: [
            {
              range: {
                date: {
                  gte: dates.dateFrom,
                  lte: dates.dateTo,
                },
              },
            },
            {
              term: {
                appId,
              },
            },
          ],
        },
      },
      size: 0,
    },
  });

  return results.body.aggregations.by_date.buckets.map(bucket => {
    return {
      date: new Date(bucket.key_as_string),
      activeTraders: bucket.traderCount.value,
    };
  });
};

const getAppMetrics = async (appId, period, granularity) => {
  const dates = getDatesForMetrics(period, granularity);

  const [basicMetrics, activeTraderMetrics] = await Promise.all([
    getBasicMetrics(appId, dates, granularity),
    getActiveTraderMetrics(appId, dates, granularity),
  ]);

  return basicMetrics.map(basicMetric => {
    const activeTradersMetric = activeTraderMetrics.find(
      m => m.date.getTime() === basicMetric.date.getTime(),
    );

    return {
      ...basicMetric,
      activeTraders: _.get(activeTradersMetric, 'activeTraders', null),
    };
  });
};

module.exports = getAppMetrics;
