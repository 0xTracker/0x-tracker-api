const moment = require('moment');

const elasticsearch = require('../util/elasticsearch');

const getValue = async (type, dateFrom, dateTo) => {
  const response = await elasticsearch.getClient().search({
    index: `${type}_metrics_hourly`,
    body: {
      aggs: {
        count: {
          cardinality: { field: type, precision_threshold: 10000 },
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

  return aggregations.count.value;
};

const computeTraderStatsForDates = async (dateFrom, dateTo) => {
  const [makerCount, takerCount, traderCount] = await Promise.all([
    getValue('maker', dateFrom, dateTo),
    getValue('taker', dateFrom, dateTo),
    getValue('trader', dateFrom, dateTo),
  ]);

  return {
    makerCount,
    takerCount,
    traderCount,
  };
};

module.exports = computeTraderStatsForDates;
