const _ = require('lodash');

const elasticsearch = require('../util/elasticsearch');
const Relayer = require('../model/relayer');

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
            size: 500,
          },
          aggs: {
            fillVolume: {
              sum: { field: 'value' },
            },
            traderCount: {
              cardinality: { field: 'traders' },
            },
            rawTradeCount: {
              sum: {
                field: 'tradeCountContribution',
              },
            },
            rawTradeVolume: {
              sum: {
                field: 'tradeVolume',
              },
            },
            tradeCount: {
              bucket_script: {
                buckets_path: {
                  fillCount: '_count',
                  tradeCount: 'rawTradeCount',
                },
                script:
                  'if (params.tradeCount == 0) { params.fillCount } else { params.tradeCount }',
              },
            },
            tradeVolume: {
              bucket_script: {
                buckets_path: {
                  fillVolume: 'fillVolume',
                  tradeVolume: 'rawTradeVolume',
                },
                script:
                  'if (params.tradeVolume == 0) { params.fillVolume } else { params.tradeVolume }',
              },
            },
            bucket_truncate: {
              bucket_sort: {
                size: limit,
                from: startIndex,
                sort: [
                  {
                    tradeVolume: { order: 'desc' },
                  },
                ],
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
  const relayers = await Relayer.find({ lookupId: { $in: relayerIds } }).lean();

  const relayersWithStats = relayerBuckets.map(bucket => {
    const relayer = relayers.find(r => r.lookupId === bucket.key);

    return {
      id: _.get(relayer, 'id', 'unknown'),
      imageUrl: _.get(relayer, 'imageUrl', null),
      name: _.get(relayer, 'name', 'Unknown'),
      slug: _.get(relayer, 'slug', 'unknown'),
      stats: {
        fillCount: bucket.doc_count,
        fillVolume: bucket.fillVolume.value,
        tradeCount: bucket.tradeCount.value,
        tradeVolume: bucket.tradeVolume.value,
        traderCount: bucket.traderCount.value,
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
