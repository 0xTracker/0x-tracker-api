const _ = require('lodash');
const moment = require('moment');

const elasticsearch = require('../util/elasticsearch');
const Relayer = require('../model/relayer');

const getRelayersWith24HourStats = async options => {
  const { page, limit } = _.defaults({}, options, {
    page: 1,
    limit: 20,
  });

  const dateTo = moment.utc().toDate();
  const dateFrom = moment
    .utc(dateTo)
    .subtract(24, 'hours')
    .toDate();

  const [unknownResponse, knownResponse] = await Promise.all([
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
              { exists: { field: 'relayerId' } },
            ],
          },
        },
      },
    }),
  ]);

  const unknownResult = unknownResponse.body.aggregations;
  const knownResults = knownResponse.body.aggregations.stats_by_relayer.buckets;
  const results = knownResults.concat({
    fillCount: unknownResult.fillCount,
    fillVolume: unknownResult.fillVolume,
    tradeCount: unknownResult.fillCount,
    tradeVolume: unknownResult.fillVolume,
  });

  const stats = _(results)
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

  const relayersWithStats = stats.map(x => {
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
      id: relayer.id,
      imageUrl: relayer.imageUrl,
      name: relayer.name,
      slug: relayer.slug,
      stats: _.omit(x, 'relayerId'),
      url: relayer.url,
    };
  });

  return {
    relayers: relayersWithStats,
    resultCount: results.length,
  };
};

module.exports = getRelayersWith24HourStats;
