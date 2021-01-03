const _ = require('lodash');

const AddressMetadata = require('../model/address-metadata');
const elasticsearch = require('../util/elasticsearch');
const getDatesForTimePeriod = require('../util/get-dates-for-time-period');

const getAggregationKey = type => {
  const key = {
    affiliate: 'affiliateAddress',
    bridge: 'assets.bridgeAddress',
    feeRecipient: 'feeRecipient',
    maker: 'maker',
    sender: 'senderAddress',
    taker: 'taker',
    transactionFrom: 'transactionFrom',
    transactionTo: 'transactionTo',
  }[type];

  if (key === undefined) {
    throw new Error(`Unsupported type: ${type}`);
  }

  return key;
};

const getAddressesForPeriod = async (type, period, options) => {
  const { limit, page, sortBy, sortDirection } = options;
  const { dateFrom, dateTo } = getDatesForTimePeriod(period);
  const startIndex = (page - 1) * limit;

  const response = await elasticsearch.getClient().search({
    index: 'fills',
    body: {
      aggs: {
        addresses: {
          terms: {
            field: getAggregationKey(type),
            size: limit * page,
            order: {
              [sortBy]: sortDirection,
            },
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
                sort: [
                  {
                    [sortBy]: { order: sortDirection },
                  },
                ],
              },
            },
          },
        },
        addressCount: {
          cardinality: {
            field: getAggregationKey(type),
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
          ],
        },
      },
    },
  });

  const addressCount = response.body.aggregations.addressCount.value;
  const addressBuckets = response.body.aggregations.addresses.buckets;
  const addresses = addressBuckets.map(bucket => bucket.key);

  const addressMetadatas = await AddressMetadata.find({
    address: { $in: addresses },
  }).lean();

  const results = addressBuckets.map(bucket => {
    const metadata = addressMetadatas.find(b => b.address === bucket.key);

    return {
      address: bucket.key,
      imageUrl: _.get(metadata, 'imageUrl', null),
      isContract: _.get(metadata, 'isContract', null),
      name: _.get(metadata, 'name', null),
      stats: {
        tradeCount: bucket.tradeCount.value,
        tradeVolume: bucket.tradeVolume.value,
      },
    };
  });

  return {
    results,
    resultCount: addressCount,
  };
};

module.exports = getAddressesForPeriod;
