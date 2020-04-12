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
  const { limit, sortBy } = _.defaults({}, options, {
    limit: 10,
    sortBy: 'tradeVolumeUSD',
  });
  const { dateFrom, dateTo } = getDatesForPeriod(period);

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
            size: limit,
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
          },
        },
      },
    },
  });

  const relayerIds = response.body.aggregations.stats_by_relayer.buckets.map(
    bucket => bucket.key,
  );

  const relayers = await Relayer.find({ lookupId: { $in: relayerIds } }).lean();

  return response.body.aggregations.stats_by_relayer.buckets.map(bucket => {
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
  });
};

module.exports = getRelayersForTokenInPeriod;
