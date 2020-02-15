const { GRANULARITY } = require('../constants');
const elasticsearch = require('../util/elasticsearch');

const INDEX_MAPPINGS = {
  [GRANULARITY.DAY]: 'active_trader_metrics_daily',
  [GRANULARITY.HOUR]: 'active_trader_metrics_hourly',
  [GRANULARITY.MONTH]: 'active_trader_metrics_monthly',
  [GRANULARITY.WEEK]: 'active_trader_metrics_weekly',
};

const getActiveTraderMetrics = async (dateFrom, dateTo, granularity) => {
  const results = await elasticsearch.getClient().search({
    body: {
      query: {
        range: {
          date: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
      },
    },
    index: INDEX_MAPPINGS[granularity],
    size: 1000, // TODO: Determine this dynamically
  });

  return results.body.hits.hits.map(x => ({
    date: new Date(x._source.date),
    makerCount: x._source.activeMakers,
    takerCount: x._source.activeTakers,
    traderCount: x._source.activeTraders,
  }));
};

module.exports = getActiveTraderMetrics;
