const _ = require('lodash');

const elasticsearch = require('../util/elasticsearch');

const aggregateMetrics = async (
  type,
  address,
  dateFrom,
  dateTo,
  granularity,
) => {
  const results = await elasticsearch.getClient().search({
    index: `${type}_metrics_hourly`,
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
              term: {
                [type]: address,
              },
            },
          ],
        },
      },
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
      metric => metric.date.toString() === date,
    );

    const makerMetric = makerMetrics.find(
      metric => metric.date.toString() === date,
    );

    const getMetricValue = key => {
      const makerValue = _.get(makerMetric, key, 0);
      const takerValue = _.get(takerMetric, key, 0);

      return {
        maker: makerValue,
        taker: takerValue,
        total: makerValue + takerValue,
      };
    };

    return {
      date: new Date(date),
      fillCount: getMetricValue('fillCount'),
      fillVolume: getMetricValue('fillVolume'),
      tradeCount: getMetricValue('tradeCount'),
      tradeVolume: getMetricValue('tradeVolume'),
    };
  });
};

const getTraderMetrics = async (address, dateFrom, dateTo, granularity) => {
  const [makerMetrics, takerMetrics] = await Promise.all([
    aggregateMetrics('maker', address, dateFrom, dateTo, granularity),
    aggregateMetrics('taker', address, dateFrom, dateTo, granularity),
  ]);

  return reduceMetrics(makerMetrics, takerMetrics);
};

module.exports = getTraderMetrics;
