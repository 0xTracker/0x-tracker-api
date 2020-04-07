const moment = require('moment');

const elasticsearch = require('../util/elasticsearch');

const computeTraderStatsForDates = async (dateFrom, dateTo) => {
  const response = await elasticsearch.getClient().search({
    index: `fills`,
    body: {
      aggs: {
        makerCount: {
          cardinality: {
            field: 'maker',
            precision_threshold: 10000,
          },
        },
        takerCount: {
          cardinality: {
            field: 'taker',
            precision_threshold: 10000,
          },
        },
        traderCount: {
          cardinality: {
            field: 'traders',
            precision_threshold: 10000,
          },
        },
      },
      size: 0,
      query: {
        range: {
          date: {
            gte: moment
              .utc(dateFrom)
              .startOf('day')
              .toDate(),
            lte: moment
              .utc(dateTo)
              .endOf('day')
              .toDate(),
          },
        },
      },
    },
  });

  const { aggregations } = response.body;
  const { makerCount, takerCount, traderCount } = aggregations;

  return {
    makerCount: makerCount.value,
    takerCount: takerCount.value,
    traderCount: traderCount.value,
  };
};

module.exports = computeTraderStatsForDates;
