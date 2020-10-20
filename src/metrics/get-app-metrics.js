const _ = require('lodash');

const elasticsearch = require('../util/elasticsearch');
const getDatesForMetrics = require('../util/get-dates-for-metrics');

const getAppMetrics = async (appId, period, granularity) => {
  const { dateFrom, dateTo } = getDatesForMetrics(period, granularity);

  const results = await elasticsearch.getClient().search({
    index: 'fills',
    body: {
      aggs: {
        by_date: {
          date_histogram: {
            field: 'date',
            calendar_interval: granularity,
            extended_bounds: {
              min: dateFrom,
              max: dateTo,
            },
          },
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
                                  'attributions.type': 0,
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
                                  'attributions.type': 1,
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
                                'attributions.type': 0,
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
                                'attributions.type': 1,
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
      size: 0,
    },
  });

  return results.body.aggregations.by_date.buckets.map(x => {
    const relayerStats = x.attributions.attribution.by_type.buckets.find(
      b => b.key === 0,
    );

    return {
      date: new Date(x.key_as_string),
      activeTraders: x.traderCount.value,
      tradeCount: {
        relayed: _.get(relayerStats, 'attribution.tradeCount.value', 0),
        total: x.tradeCount.value,
      },
      tradeVolume: {
        relayed: _.get(relayerStats, 'attribution.tradeVolume.value', 0),
        total: x.tradeVolume.value,
      },
    };
  });
};

module.exports = getAppMetrics;
