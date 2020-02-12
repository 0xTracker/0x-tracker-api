const _ = require('lodash');

const elasticsearch = require('../util/elasticsearch');
const Relayer = require('../model/relayer');

const getRelayersWithStatsForDates = async (dateFrom, dateTo, options) => {
  const { page, limit } = _.defaults({}, options, {
    page: 1,
    limit: 20,
  });

  const [unknownResults, knownResults] = await Promise.all([
    elasticsearch.getClient().search({
      index: 'unknown_relayer_metrics_hourly',
      body: {
        aggs: {
          fillCount: {
            sum: { field: 'fillCount' },
          },
          fillVolume: {
            sum: { field: 'fillVolume' },
          },
          tradeCount: {
            sum: { field: 'tradeCount' },
          },
          tradeVolume: {
            sum: { field: 'tradeVolume' },
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
    }),
    elasticsearch.getClient().search({
      index: 'relayer_metrics_hourly',
      body: {
        aggs: {
          stats_by_relayer: {
            terms: {
              field: 'relayerId',
              order: { tradeVolume: 'desc' },
              size: 500,
            },
            aggs: {
              fillCount: {
                sum: { field: 'fillCount' },
              },
              fillVolume: {
                sum: { field: 'fillVolume' },
              },
              tradeCount: {
                sum: { field: 'tradeCount' },
              },
              tradeVolume: {
                sum: { field: 'tradeVolume' },
              },
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
    }),
  ]);

  const stats = _(knownResults.body.aggregations.stats_by_relayer.buckets)
    .concat({
      fillCount: unknownResults.body.aggregations.fillCount,
      fillVolume: unknownResults.body.aggregations.fillVolume,
      tradeCount: unknownResults.body.aggregations.fillCount,
      tradeVolume: unknownResults.body.aggregations.fillVolume,
    })
    .orderBy('tradeVolume.value', 'desc')
    .drop((page - 1) * limit)
    .take(limit)
    .map(x => ({
      relayerId: x.key,
      fillCount: x.fillCount.value,
      fillVolume: x.fillVolume.value,
      tradeCount: x.tradeCount.value,
      tradeVolume: x.tradeVolume.value,
    }))
    .value();

  const relayerIds = stats.map(x => x.relayerId);
  const relayers = await Relayer.find({ lookupId: { $in: relayerIds } }).lean();

  const results = stats.map(x => {
    if (x.relayerId === undefined) {
      return {
        id: 'unknown',
        name: 'Unknown',
        slug: 'unknown',
        stats: _.omit(x, 'relayerId'),
      };
    }

    const relayer = relayers.find(r => r.lookupId === x.relayerId);

    return {
      ..._.pick(relayer, 'name', 'id', 'url', 'imageUrl', 'slug'),
      stats: _.omit(x, 'relayerId'),
    };
  });

  return {
    relayers: results,
    resultCount: knownResults.body.aggregations.stats_by_relayer.buckets.length,
  };
};

module.exports = getRelayersWithStatsForDates;
