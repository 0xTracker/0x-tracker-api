const _ = require('lodash');

const elasticsearch = require('../util/elasticsearch');
const getDatesForPeriod = require('../util/get-dates-for-time-period');
const Relayer = require('../model/relayer');

const getElasticsearchOrderByKey = sortBy => {
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
            missing: -1,
            size: limit * page,
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
            rawTradeCount: {
              sum: {
                field: 'tradeCountContribution',
              },
            },
            rawTradeVolume: {
              sum: {
                field: 'tradedAmount',
              },
            },
            rawTradeVolumeUSD: {
              sum: {
                field: 'tradedAmountUSD',
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
            tradeVolumeUSD: {
              bucket_script: {
                buckets_path: {
                  fillVolumeUSD: 'fillVolumeUSD',
                  tradeVolumeUSD: 'rawTradeVolumeUSD',
                },
                script:
                  'if (params.tradeVolumeUSD == 0) { params.fillVolumeUSD } else { params.tradeVolumeUSD }',
              },
            },
            bucket_truncate: {
              bucket_sort: {
                size: limit,
                from: startIndex,
                sort: [
                  {
                    [getElasticsearchOrderByKey(sortBy)]: { order: 'desc' },
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
    },
  });

  const relayerIds = response.body.aggregations.stats_by_relayer.buckets.map(
    bucket => bucket.key,
  );

  const relayers = await Relayer.find({ lookupId: { $in: relayerIds } }).lean();
  const relayerCount = response.body.aggregations.relayerCount.value;
  const relayersWithStats = response.body.aggregations.stats_by_relayer.buckets.map(
    bucket => {
      const relayer = relayers.find(r => r.lookupId === bucket.key);

      return {
        id: _.get(relayer, 'id', 'unknown'),
        imageUrl: _.get(relayer, 'imageUrl', null),
        name: _.get(relayer, 'name', 'Unknown'),
        slug: _.get(relayer, 'slug', 'unknown'),
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
  );

  return {
    relayers: relayersWithStats,
    resultCount: relayerCount,
  };
};

module.exports = getRelayersForTokenInPeriod;
