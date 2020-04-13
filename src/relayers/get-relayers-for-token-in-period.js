const _ = require('lodash');

const elasticsearch = require('../util/elasticsearch');
const getDatesForPeriod = require('../util/get-dates-for-time-period');
const Relayer = require('../model/relayer');

const getOrderByKey = sortBy => {
  if (sortBy === 'fillCount') {
    return '_count';
  }

  return sortBy;
};

const getRelayersForTokenInPeriod = async (tokenAddress, period, options) => {
  const { limit, page, sortBy } = options;
  const { dateFrom, dateTo } = getDatesForPeriod(period);

  const startIndex = (page - 1) * limit;

  const response = await elasticsearch.getClient().search({
    index: 'traded_tokens',
    body: {
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
              term: {
                tokenAddress,
              },
            },
          ],
        },
      },
      aggs: {
        stats_by_relayer: {
          terms: {
            field: 'relayerId',
            size: limit * page,
            missing: -1,
            order: {
              [getOrderByKey(sortBy)]: 'desc',
            },
          },
          aggs: {
            fillVolume: {
              sum: {
                field: 'filledAmount',
              },
            },
            fillVolumeUSD: {
              sum: {
                field: 'filledAmountUSD',
              },
            },
            tradeCount: {
              sum: {
                field: 'tradeCountContribution',
              },
            },
            tradeVolume: {
              sum: {
                field: 'tradedAmount',
              },
            },
            tradeVolumeUSD: {
              sum: {
                field: 'tradedAmountUSD',
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
    },
  });

  const relayerIds = response.body.aggregations.stats_by_relayer.buckets.map(
    bucket => bucket.key,
  );

  const relayers = await Relayer.find({ lookupId: { $in: relayerIds } }).lean();

  const relayerCount = response.body.aggregations.relayerCount.value;

  return {
    relayers: response.body.aggregations.stats_by_relayer.buckets.map(
      bucket => {
        const relayer =
          bucket.key === -1
            ? { id: 'unknown', name: 'Unknown', slug: 'unknown' }
            : relayers.find(r => r.lookupId === bucket.key);

        return {
          id: _.get(relayer, 'id', null),
          imageUrl: _.get(relayer, 'imageUrl', null),
          name: _.get(relayer, 'name', null),
          slug: _.get(relayer, 'slug', null),
          stats: {
            fillCount: bucket.doc_count,
            fillVolume: {
              token: bucket.fillVolume.value,
              USD: bucket.fillVolumeUSD.value,
            },
            tradeCount: bucket.tradeCount.value,
            tradeVolume: {
              token: bucket.tradeVolume.value,
              USD: bucket.tradeVolumeUSD.value,
            },
          },
          url: _.get(relayer, 'url', null),
        };
      },
    ),
    resultCount: relayerCount,
  };
};

module.exports = getRelayersForTokenInPeriod;
