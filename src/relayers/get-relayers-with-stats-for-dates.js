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
      index: 'fills',
      body: {
        aggs: {
          fillCount: {
            value_count: { field: '_id' },
          },
          fillVolume: {
            sum: { field: 'value' },
          },
          traderCount: {
            cardinality: { field: 'traders' },
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
            ],
            must_not: [{ exists: { field: 'relayerId' } }],
          },
        },
      },
    }),
    elasticsearch.getClient().search({
      index: 'fills',
      body: {
        aggs: {
          stats_by_relayer: {
            terms: {
              field: 'relayerId',
              order: { tradeVolume: 'desc' },
              size: 500,
            },
            aggs: {
              fillVolume: {
                sum: { field: 'value' },
              },
              tradeCount: {
                sum: { field: 'tradeCountContribution' },
              },
              tradeVolume: {
                sum: { field: 'tradeVolume' },
              },
              traderCount: {
                cardinality: { field: 'traders' },
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
    .map(x => ({
      fillCount: x.doc_count,
      fillVolume: x.fillVolume.value,
      relayerId: x.key,
      tradeCount: x.tradeCount.value,
      tradeVolume: x.tradeVolume.value,
      traderCount: x.traderCount.value,
    }))
    .concat({
      fillCount: unknownResults.body.aggregations.fillCount.value,
      fillVolume: unknownResults.body.aggregations.fillVolume.value,
      tradeCount: unknownResults.body.aggregations.fillCount.value,
      tradeVolume: unknownResults.body.aggregations.fillVolume.value,
      traderCount: unknownResults.body.aggregations.traderCount.value,
    })
    .orderBy('tradeVolume', 'desc')
    .drop((page - 1) * limit)
    .take(limit)
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
    resultCount:
      knownResults.body.aggregations.stats_by_relayer.buckets.length + 1,
  };
};

module.exports = getRelayersWithStatsForDates;
