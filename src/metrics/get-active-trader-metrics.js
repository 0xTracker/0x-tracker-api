const { GRANULARITY } = require('../constants');
const elasticsearch = require('../util/elasticsearch');
const getDatesForMetrics = require('../util/get-dates-for-metrics');
const padMetrics = require('./pad-metrics');

const INDEX_MAPPINGS = {
  [GRANULARITY.DAY]: 'active_trader_metrics_daily',
  [GRANULARITY.HOUR]: 'active_trader_metrics_hourly',
  [GRANULARITY.MONTH]: 'active_trader_metrics_monthly',
  [GRANULARITY.WEEK]: 'active_trader_metrics_weekly',
};

const getActiveTraderMetrics = async (period, granularity) => {
  const { dateFrom, dateTo } = getDatesForMetrics(period, granularity);

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

  return padMetrics(
    results.body.hits.hits.map(x => ({
      date: new Date(x._source.date),
      makerCount: x._source.activeMakers,
      takerCount: x._source.activeTakers,
      traderCount: x._source.activeTraders,
    })),
    period,
    granularity,
    { makerCount: 0, takerCount: 0, traderCount: 0 },
  );
};

module.exports = getActiveTraderMetrics;
