const moment = require('moment');

const elasticsearch = require('../util/elasticsearch');
const Relayer = require('../model/relayer');

const getSuggestedRelayers = async limit => {
  const response = await elasticsearch.getClient().search({
    index: 'fills',
    body: {
      aggs: {
        relayers: {
          terms: {
            field: 'relayerId',
            order: { tradeVolume: 'desc' },
            size: limit,
          },
          aggs: {
            tradeVolume: {
              sum: {
                field: 'tradeVolume',
              },
            },
            bucket_truncate: {
              bucket_sort: {
                size: limit,
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
            gte: moment()
              .subtract(30, 'days')
              .toDate(),
          },
        },
      },
    },
  });

  const relayerBuckets = response.body.aggregations.relayers.buckets;
  const relayerIds = relayerBuckets.map(bucket => bucket.key);
  const relayers = await Relayer.find({ lookupId: { $in: relayerIds } }).lean();

  const relayersWithStats = relayerBuckets.map(bucket => {
    const relayer = relayers.find(r => r.lookupId === bucket.key);

    return {
      id: relayer.id,
      imageUrl: relayer.imageUrl,
      name: relayer.name,
      slug: relayer.slug,
      url: relayer.url,
    };
  });

  return relayersWithStats;
};

const searchRelayers = async (query, options) => {
  if (query === '' || query === null) {
    const relayers = await getSuggestedRelayers(options.limit);

    return relayers;
  }

  const relayers = await Relayer.find({ name: new RegExp(query, 'ig') })
    .sort({ name: 1 })
    .limit(options.limit)
    .lean();

  return relayers.map(relayer => ({
    id: relayer.id,
    imageUrl: relayer.imageUrl,
    name: relayer.name,
    slug: relayer.slug,
    url: relayer.url,
  }));
};

module.exports = searchRelayers;
