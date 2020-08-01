const elasticsearch = require('../util/elasticsearch');
const getDatesForTimePeriod = require('../util/get-dates-for-time-period');

const getStatsForDates = async (appId, dateFrom, dateTo) => {
  const res = await elasticsearch.getClient().search({
    index: 'app_fill_attributions',
    body: {
      aggs: {
        relayedTrades: {
          sum: { field: 'relayedTrades' },
        },
        relayedVolume: {
          sum: { field: 'relayedVolume' },
        },
        sourcedTrades: {
          sum: { field: 'sourcedTrades' },
        },
        sourcedVolume: {
          sum: { field: 'sourcedVolume' },
        },
        totalTrades: {
          sum: { field: 'totalTrades' },
        },
        totalVolume: {
          sum: { field: 'totalVolume' },
        },
      },
      size: 0,
      query: {
        bool: {
          filter: [
            { term: { appId } },
            {
              range: {
                date: {
                  gte: dateFrom,
                  lte: dateTo,
                },
              },
            },
          ],
        },
      },
    },
  });

  const {
    relayedTrades,
    relayedVolume,
    sourcedTrades,
    sourcedVolume,
    totalTrades,
    totalVolume,
  } = res.body.aggregations;

  return {
    relayedTrades: relayedTrades.value,
    relayedVolume: relayedVolume.value,
    sourcedTrades: sourcedTrades.value,
    sourcedVolume: sourcedVolume.value,
    totalTrades: totalTrades.value,
    totalVolume: totalVolume.value,
  };
};

const getRelayerStatsForPeriod = async (appId, period) => {
  const { dateFrom, dateTo } = getDatesForTimePeriod(period);
  const stats = await getStatsForDates(appId, dateFrom, dateTo);

  return {
    relayedTrades: stats.relayedTrades,
    relayedVolume: stats.relayedVolume,
    sourcedTrades: stats.sourcedTrades,
    sourcedVolume: stats.sourcedVolume,
    totalTrades: stats.totalTrades,
    totalVolume: stats.totalVolume,
  };
};

module.exports = getRelayerStatsForPeriod;
