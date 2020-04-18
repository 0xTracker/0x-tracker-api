const _ = require('lodash');

const computeNetworkStatsForDates = require('../stats/compute-network-stats-for-dates');
const elasticsearch = require('../util/elasticsearch');
const getDatesForTimePeriod = require('../util/get-dates-for-time-period');

const getAssetBridgingStatsForPeriod = async period => {
  const { dateFrom, dateTo } = getDatesForTimePeriod(period);
  const networkStats = await computeNetworkStatsForDates(dateFrom, dateTo);
  const response = await elasticsearch.getClient().search({
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
        tradeVolume: {
          sum: { field: 'tradeVolume' },
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
              exists: {
                field: 'assets.bridgeAddress',
              },
            },
          ],
        },
      },
    },
  });

  const getValue = key => _.get(response.body.aggregations, `${key}.value`);

  const fillCount = getValue('fillCount');
  const fillVolume = getValue('fillVolume');
  const tradeCount = getValue('tradeCount');
  const tradeVolume = getValue('tradeVolume');

  return {
    fillCount,
    fillCountShare: (fillCount / networkStats.fillCount) * 100,
    fillVolume,
    fillVolumeShare: (fillVolume / networkStats.fillVolume) * 100,
    tradeCount,
    tradeCountShare: (tradeCount / networkStats.tradeCount) * 100,
    tradeVolume,
    tradeVolumeShare: (tradeVolume / networkStats.tradeVolume) * 100,
  };
};

module.exports = getAssetBridgingStatsForPeriod;
