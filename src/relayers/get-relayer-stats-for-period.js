const elasticsearch = require('../util/elasticsearch');
const getDatesForTimePeriod = require('../util/get-dates-for-time-period');

const getRelayerStatsForPeriod = async (relayerId, period) => {
  const { dateFrom, dateTo } = getDatesForTimePeriod(period);
  const res = await elasticsearch.getClient().search({
    index: 'fills',
    body: {
      aggs: {
        fillCount: {
          value_count: { field: '_id' },
        },
        fillVolume: {
          sum: { field: 'value' },
        },
        tradeCount: {
          sum: { field: 'tradeCountContribution' },
        },
        traderCount: {
          cardinality: { field: 'traders' },
        },
        tradeVolume: {
          sum: { field: 'tradeVolume' },
        },
      },
      size: 0,
      query: {
        bool: {
          filter: [
            { term: { relayerId } },
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
    fillCount,
    fillVolume,
    tradeCount,
    traderCount,
    tradeVolume,
  } = res.body.aggregations;

  return {
    fillCount: fillCount.value,
    fillVolume: fillVolume.value,
    tradeCount: tradeCount.value,
    traderCount: traderCount.value,
    tradeVolume: tradeVolume.value,
  };
};

module.exports = getRelayerStatsForPeriod;
