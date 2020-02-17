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
            gte: dateFrom,
            lte: dateTo,
          },
        },
      },
    },
  });

  const { aggregations } = response.body;

  return aggregations.count.value;
};

const compute24HourTraderStats = async () => {
  const dateTo = moment.utc().toDate();
  const dateFrom = moment
    .utc(dateTo)
    .subtract(24, 'hours')
    .toDate();

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

module.exports = compute24HourTraderStats;
