const _ = require('lodash');

const { FILL_ATTRIBUTION_TYPE } = require('../constants');
const elasticsearch = require('../util/elasticsearch');
const getDatesForTimePeriod = require('../util/get-dates-for-time-period');

const getStatsForDates = async (appId, dateFrom, dateTo) => {
  const res = await elasticsearch.getClient().search({
    index: 'fills',
    body: {
      aggs: {
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
  const stats = await getStatsForDates(appId, dateFrom, dateTo);

  return stats;
};

module.exports = getRelayerStatsForPeriod;
