const _ = require('lodash');

const { FILL_ATTRIBUTION_TYPE, TIME_PERIOD } = require('../constants');
const elasticsearch = require('../util/elasticsearch');
const getDatesForTimePeriod = require('../util/get-dates-for-time-period');
const getPercentageChange = require('../util/get-percentage-change');
const getPreviousPeriod = require('../util/get-previous-period');

const getStatsForDates = async (appId, dateFrom, dateTo) => {
  const res = await elasticsearch.getClient().search({
    index: 'fills',
    body: {
      aggs: {
        avgTradeSize: {
          avg: {
            field: 'tradeVolume',
          },
        },
        traderCount: {
          cardinality: {
            field: 'traders',
          },
        },
        tradeCount: {
          sum: {
            field: 'tradeCountContribution',
          },
        },
        tradeVolume: {
          sum: {
            field: 'tradeVolume',
          },
        },
        attributions: {
          nested: {
            path: 'attributions',
          },
          aggs: {
            attribution: {
              filter: {
                bool: {
                  minimum_should_match: 1,
                  should: [
                    {
                      bool: {
                        filter: [
                          {
                            term: {
                              'attributions.id': appId,
                            },
                          },
                          {
                            term: {
                              'attributions.type':
                                FILL_ATTRIBUTION_TYPE.RELAYER,
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              aggs: {
                by_type: {
                  terms: {
                    field: 'attributions.type',
                    size: 10,
                  },
                  aggs: {
                    attribution: {
                      reverse_nested: {},
                      aggs: {
                        tradeCount: {
                          sum: {
                            field: 'tradeCountContribution',
                          },
                        },
                        tradeVolume: {
                          sum: {
                            field: 'tradeVolume',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
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
              nested: {
                path: 'attributions',
                query: {
                  bool: {
                    minimum_should_match: 1,
                    should: [
                      {
                        bool: {
                          filter: [
                            {
                              term: {
                                'attributions.id': appId,
                              },
                            },
                            {
                              term: {
                                'attributions.type':
                                  FILL_ATTRIBUTION_TYPE.RELAYER,
                              },
                            },
                          ],
                        },
                      },
                      {
                        bool: {
                          filter: [
                            {
                              term: {
                                'attributions.id': appId,
                              },
                            },
                            {
                              term: {
                                'attributions.type':
                                  FILL_ATTRIBUTION_TYPE.CONSUMER,
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              },
            },
          ],
        },
      },
    },
  });

  const relayerStats = res.body.aggregations.attributions.attribution.by_type.buckets.find(
    b => b.key === 0,
  );

  return {
    activeTraders: res.body.aggregations.traderCount.value,
    avgTradeSize: res.body.aggregations.avgTradeSize.value,
    tradeCount: {
      relayed: _.get(relayerStats, 'attribution.tradeCount.value', 0),
      total: res.body.aggregations.tradeCount.value,
    },
    tradeVolume: {
      relayed: _.get(relayerStats, 'attribution.tradeVolume.value', 0),
      total: res.body.aggregations.tradeVolume.value,
    },
  };
};

const getRelayerStatsForPeriod = async (appId, period) => {
  const { dateFrom, dateTo } = getDatesForTimePeriod(period);
  const { prevDateFrom, prevDateTo } = getPreviousPeriod(dateFrom, dateTo);

  const [stats, prevStats] = await Promise.all([
    getStatsForDates(appId, dateFrom, dateTo),
    period === TIME_PERIOD.ALL
      ? undefined
      : await getStatsForDates(appId, prevDateFrom, prevDateTo),
  ]);

  const { activeTraders, avgTradeSize, tradeCount, tradeVolume } = stats;

  const prevActiveTraders = _.get(prevStats, 'activeTraders', null);
  const prevAvgTradeSize = _.get(prevStats, 'avgTradeSize', null);
  const prevTradeCountRelayed = _.get(prevStats, 'tradeCount.relayed', null);
  const prevTradeCountTotal = _.get(prevStats, 'tradeCount.total', null);
  const prevTradeVolumeRelayed = _.get(prevStats, 'tradeVolume.relayed', null);
  const prevTradeVolumeTotal = _.get(prevStats, 'tradeVolume.total', null);

  return {
    activeTraders,
    activeTradersChange: getPercentageChange(prevActiveTraders, activeTraders),
    avgTradeSize,
    avgTradeSizeChange: getPercentageChange(prevAvgTradeSize, avgTradeSize),
    tradeCount,
    tradeCountChange: {
      relayed: getPercentageChange(prevTradeCountRelayed, tradeCount.relayed),
      total: getPercentageChange(prevTradeCountTotal, tradeCount.total),
    },
    tradeVolume: stats.tradeVolume,
    tradeVolumeChange: {
      relayed: getPercentageChange(prevTradeVolumeRelayed, tradeVolume.relayed),
      total: getPercentageChange(prevTradeVolumeTotal, tradeVolume.total),
    },
  };
};

module.exports = getRelayerStatsForPeriod;
