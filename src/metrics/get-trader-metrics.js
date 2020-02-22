const _ = require('lodash');

const { GRANULARITY } = require('../constants');
const elasticsearch = require('../util/elasticsearch');

const aggregateMetrics = async (
  type,
  address,
  dateFrom,
  dateTo,
  granularity,
) => {
  const query = {
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
          term: {
            [type]: address,
          },
        },
      ],
    },
  };

  const index = `${type}_metrics_hourly`;

  if (granularity === GRANULARITY.HOUR) {
    const results = await elasticsearch.getClient().search({
      body: {
        query,
      },
      index,
      size: 200, // TODO: Determine this dynamically
    });

    return results.body.hits.hits.map(x => ({
      date: new Date(x._source.date),
      fillCount: x._source.fillCount,
      fillVolume: x._source.fillVolume,
      tradeCount: x._source.tradeCount,
      tradeVolume: x._source.tradeVolume,
    }));
  }

  const results = await elasticsearch.getClient().search({
    index,
    body: {
      aggs: {
        metrics: {
          date_histogram: {
            field: 'date',
            calendar_interval: granularity,
          },
          aggs: {
            fillCount: {
              sum: { field: 'fillCount' },
            },
            fillVolume: {
              sum: { field: 'fillVolume' },
            },
            tradeCount: {
              sum: { field: 'tradeCount' },
            },
            tradeVolume: {
              sum: { field: 'tradeVolume' },
            },
          },
        },
      },
      size: 0,
      query,
    },
  });

  return results.body.aggregations.metrics.buckets.map(x => ({
    date: new Date(x.key_as_string),
    fillCount: x.fillCount.value,
    fillVolume: x.fillVolume.value,
    tradeCount: x.tradeCount.value,
    tradeVolume: x.tradeVolume.value,
  }));
};

const reduceMetrics = (makerMetrics, takerMetrics) => {
  const dates = _(makerMetrics)
    .concat(takerMetrics)
    .map(metric => metric.date.toString())
    .uniq()
    .value();

  return dates.map(date => {
    const takerMetric = takerMetrics.find(
      metric => metric.date.toString() === date.toString(),
    );

    const makerMetric = makerMetrics.find(
      metric => metric.date.toString() === date.toString(),
    );

    return {
      date: new Date(date),
      fillCount: {
        maker: _.get(makerMetric, 'fillCount', 0),
        taker: _.get(takerMetric, 'fillCount', 0),
        total:
          _.get(makerMetric, 'fillCount', 0) +
          _.get(takerMetric, 'fillCount', 0),
      },
      fillVolume: {
        maker: _.get(makerMetric, 'fillVolume', 0),
        taker: _.get(takerMetric, 'fillVolume', 0),
        total:
          _.get(makerMetric, 'fillVolume', 0) +
          _.get(takerMetric, 'fillVolume', 0),
      },
      tradeCount: {
        maker: _.get(makerMetric, 'tradeCount', 0),
        taker: _.get(takerMetric, 'tradeCount', 0),
        total:
          _.get(makerMetric, 'tradeCount', 0) +
          _.get(takerMetric, 'tradeCount', 0),
      },
      tradeVolume: {
        maker: _.get(makerMetric, 'tradeVolume', 0),
        taker: _.get(takerMetric, 'tradeVolume', 0),
        total:
          _.get(makerMetric, 'tradeVolume', 0) +
          _.get(takerMetric, 'tradeVolume', 0),
      },
    };
  });
};

const getTraderMetrics = async (address, dateFrom, dateTo, granularity) => {
  const [makerMetrics, takerMetrics] = await Promise.all([
    aggregateMetrics('maker', address, dateFrom, dateTo, granularity),
    aggregateMetrics('taker', address, dateFrom, dateTo, granularity),
  ]);

  const mets = reduceMetrics(makerMetrics, takerMetrics);

  return mets;
};

module.exports = getTraderMetrics;
