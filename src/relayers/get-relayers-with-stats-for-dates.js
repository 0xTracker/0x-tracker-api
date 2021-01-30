const _ = require('lodash');

const elasticsearch = require('../util/elasticsearch');
const Relayer = require('../model/relayer');
const getPreviousPeriod = require('../util/get-previous-period');
const getPercentageChange = require('../util/get-percentage-change');

const getQueryForRelayers = (relayerIds, dateFrom, dateTo) => ({
  bool: {
    must: {
      bool: {
        should: [
          relayerIds.includes(-1)
            ? {
                bool: {
                  must_not: {
                    exists: {
                      field: 'relayerId',
                    },
                  },
                },
              }
            : undefined,
          {
            terms: {
              relayerId: relayerIds,
            },
          },
        ].filter(s => s !== undefined),
      },
    },
    filter: [
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
});

const getActiveTraderStats = async (relayerIds, dateFrom, dateTo) => {
  const response = await elasticsearch.getClient().search({
    index: 'trader_fills',
    body: {
      aggs: {
        relayers: {
          terms: {
            field: 'relayerId',
            missing: -1,
            size: relayerIds.length,
          },
          aggs: {
            traderCount: {
              cardinality: { field: 'address' },
            },
          },
        },
      },
      size: 0,
      query: getQueryForRelayers(relayerIds, dateFrom, dateTo),
    },
  });

  const { buckets } = response.body.aggregations.relayers;

  return relayerIds.map(relayerId => {
    const bucket = buckets.find(b => b.key === relayerId);

    return {
      traderCount: _.get(bucket, 'traderCount.value', 0),
      relayerId,
    };
  });
};

const getStatsForPreviousPeriod = async (relayerIds, dateFrom, dateTo) => {
  const { prevDateFrom, prevDateTo } = getPreviousPeriod(dateFrom, dateTo);

  const [response, activeTraderStats] = await Promise.all([
    elasticsearch.getClient().search({
      index: 'fills',
      body: {
        aggs: {
          relayers: {
            terms: {
              field: 'relayerId',
              missing: -1,
              order: { tradeVolume: 'desc' },
              size: relayerIds.length,
            },
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
        size: 0,
        query: getQueryForRelayers(relayerIds, prevDateFrom, prevDateTo),
      },
    }),
    getActiveTraderStats(relayerIds, prevDateFrom, prevDateTo),
  ]);

  const { buckets } = response.body.aggregations.relayers;

  return relayerIds.map(relayerId => {
    const bucket = buckets.find(b => b.key === relayerId);
    const activeTraders = _.get(
      activeTraderStats.find(x => x.relayerId === relayerId),
      'traderCount',
      0,
    );

    return {
      tradeCount: _.get(bucket, 'tradeCount.value', 0),
      tradeVolume: _.get(bucket, 'tradeVolume.value', 0),
      traderCount: activeTraders,
      relayerId,
    };
  });
};

const getRelayersWithStatsForDates = async (dateFrom, dateTo, options) => {
  const { page, limit } = _.defaults({}, options, {
    page: 1,
    limit: 20,
  });

  const startIndex = (page - 1) * limit;

  const response = await elasticsearch.getClient().search({
    index: 'fills',
    body: {
      aggs: {
        relayers: {
          terms: {
            field: 'relayerId',
            missing: -1,
            order: { tradeVolume: 'desc' },
            size: 500,
          },
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
            bucket_truncate: {
              bucket_sort: {
                size: limit,
                from: startIndex,
              },
            },
          },
        },
        relayerCount: {
          cardinality: {
            field: 'relayerId',
          },
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

  const relayerCount = response.body.aggregations.relayerCount.value;
  const relayerBuckets = response.body.aggregations.relayers.buckets;
  const relayerIds = relayerBuckets.map(bucket => bucket.key);
  const [relayers, previousStats, activeTraderStats] = await Promise.all([
    Relayer.find({ lookupId: { $in: relayerIds } }).lean(),
    getStatsForPreviousPeriod(relayerIds, dateFrom, dateTo),
    getActiveTraderStats(relayerIds, dateFrom, dateTo),
  ]);

  const relayersWithStats = relayerBuckets.map(bucket => {
    const relayerId = bucket.key;
    const relayer = relayers.find(r => r.lookupId === relayerId);
    const prev = previousStats.find(s => s.relayerId === bucket.key);
    const activeTraders = _.get(
      activeTraderStats.find(x => x.relayerId === relayerId),
      'traderCount',
      0,
    );

    return {
      id: _.get(relayer, 'id', 'unknown'),
      imageUrl: _.get(relayer, 'imageUrl', null),
      name: _.get(relayer, 'name', 'Unknown'),
      slug: _.get(relayer, 'slug', 'unknown'),
      stats: {
        tradeCount: bucket.tradeCount.value,
        tradeCountChange: getPercentageChange(
          prev.tradeCount,
          bucket.tradeCount.value,
        ),
        tradeVolume: bucket.tradeVolume.value,
        tradeVolumeChange: getPercentageChange(
          prev.tradeVolume,
          bucket.tradeVolume.value,
        ),
        traderCount: activeTraders,
        traderCountChange: getPercentageChange(prev.traderCount, activeTraders),
      },
      url: _.get(relayer, 'url', null),
    };
  });

  return {
    relayers: relayersWithStats,
    resultCount: relayerCount,
  };
};

module.exports = getRelayersWithStatsForDates;
