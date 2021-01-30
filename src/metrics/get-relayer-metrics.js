const elasticsearch = require('../util/elasticsearch');
const getDatesForMetrics = require('../util/get-dates-for-metrics');

const getQuery = (relayerId, dateFrom, dateTo) => {
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
        relayerId !== null
          ? {
              term: {
                relayerId,
              },
            }
          : undefined,
      ].filter(x => x !== undefined),
      must_not: [
        relayerId === null
          ? {
              exists: {
                field: 'relayerId',
              },
            }
          : undefined,
      ].filter(x => x !== undefined),
    },
  };
};

const getTraderMetrics = async (relayerId, dateFrom, dateTo, granularity) => {
  const results = await elasticsearch.getClient().search({
    index: 'trader_fills',
    body: {
      aggs: {
        metrics_by_date: {
          date_histogram: {
            field: 'date',
            calendar_interval: granularity,
            extended_bounds: {
              min: dateFrom,
              max: dateTo,
            },
          },
          aggs: {
            traderCount: {
              cardinality: { field: 'address' },
            },
          },
        },
      },
      size: 0,
      query: getQuery(relayerId, dateFrom, dateTo),
    },
  });

  return results.body.aggregations.metrics_by_date.buckets.map(x => ({
    date: new Date(x.key_as_string),
    traderCount: x.traderCount.value,
  }));
};

const getBasicMetrics = async (relayerId, dateFrom, dateTo, granularity) => {
  const results = await elasticsearch.getClient().search({
    index: 'fills',
    body: {
      aggs: {
        metrics_by_date: {
          date_histogram: {
            field: 'date',
            calendar_interval: granularity,
            extended_bounds: {
              min: dateFrom,
              max: dateTo,
            },
          },
          aggs: {
            tradeCount: {
              sum: { field: 'tradeCountContribution' },
            },
            tradeVolume: {
              sum: { field: 'tradeVolume' },
            },
          },
        },
      },
      size: 0,
      query: getQuery(relayerId, dateFrom, dateTo),
    },
  });

  return results.body.aggregations.metrics_by_date.buckets.map(x => ({
    date: new Date(x.key_as_string),
    tradeCount: relayerId === null ? x.doc_count : x.tradeCount.value,
    tradeVolume: relayerId === null ? x.fillVolume.value : x.tradeVolume.value,
  }));
};

const getRelayerMetrics = async (relayerId, period, granularity) => {
  const { dateFrom, dateTo } = getDatesForMetrics(period, granularity);

  const [basicMetrics, traderMetrics] = await Promise.all([
    getBasicMetrics(relayerId, dateFrom, dateTo, granularity),
    getTraderMetrics(relayerId, dateFrom, dateTo, granularity),
  ]);

  const combinedMetrics = basicMetrics.map(basicMetric => {
    const traderMetric = traderMetrics.find(
      tm => tm.date.toISOString() === basicMetric.date.toISOString(),
    );

    return {
      ...basicMetric,
      traderCount: traderMetric.traderCount,
    };
  });

  return combinedMetrics;
};

module.exports = getRelayerMetrics;
