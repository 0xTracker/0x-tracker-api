const moment = require('moment');

const elasticsearch = require('../util/elasticsearch');

const compute24HourTraderStats = async () => {
  const dateTo = moment.utc().toDate();
  const dateFrom = moment
    .utc(dateTo)
    .subtract(24, 'hours')
    .toDate();

  const response = await elasticsearch.getClient().search({
    index: 'fills',
    body: {
      aggs: {
        makerCount: {
          cardinality: { field: 'maker.keyword', precision_threshold: 10000 },
        },
        takerCount: {
          cardinality: { field: 'taker.keyword', precision_threshold: 10000 },
        },
        traderCount: {
          cardinality: { field: 'traders.keyword', precision_threshold: 10000 },
        },
      },
      size: 0,
      query: {
        range: {
          date: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
      },
    },
  });

  const { aggregations } = response.body;

  return {
    makerCount: aggregations.makerCount.value,
    takerCount: aggregations.takerCount.value,
    traderCount: aggregations.traderCount.value,
  };
};

module.exports = compute24HourTraderStats;
