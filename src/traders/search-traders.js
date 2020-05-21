const _ = require('lodash');
const moment = require('moment');

const elasticsearch = require('../util/elasticsearch');
const AddressMetadata = require('../model/address-metadata');

const getSuggestedTraders = async limit => {
  const response = await elasticsearch.getClient().search({
    index: 'fills',
    body: {
      aggs: {
        traders: {
          terms: {
            field: 'traders',
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

  const { buckets } = response.body.aggregations.traders;
  const addresses = buckets.map(bucket => bucket.key);
  const metadatas = await AddressMetadata.find({
    address: { $in: addresses },
  }).lean();

  const traders = addresses.map(address => {
    const addressMetadata = metadatas.find(r => r.address === address);

    return {
      address,
      name: _.get(addressMetadata, 'name', null),
    };
  });

  return traders;
};

const getValidTraderAddresses = async (addresses, limit) => {
  const response = await elasticsearch.getClient().search({
    index: 'fills',
    body: {
      aggs: {
        matching_makers: {
          filter: {
            terms: {
              maker: addresses,
            },
          },
          aggs: {
            makers: {
              terms: {
                field: 'maker',
                size: limit,
              },
            },
          },
        },
        matching_takers: {
          filter: {
            terms: {
              taker: addresses,
            },
          },
          aggs: {
            takers: {
              terms: {
                field: 'taker',
                size: limit,
              },
            },
          },
        },
      },
      size: 0,
    },
  });

  const buckets = response.body.aggregations.matching_makers.makers.buckets.concat(
    response.body.aggregations.matching_takers.takers.buckets,
  );

  const validAddresses = buckets.map(bucket => bucket.key);

  return validAddresses;
};

const searchTraders = async (query, options) => {
  if (query === '' || query === null) {
    const traders = await getSuggestedTraders(options.limit);

    return traders;
  }

  const metadatas = await AddressMetadata.find({
    name: new RegExp(query, 'ig'),
  })
    .sort({ name: 1 })
    .limit(options.limit)
    .lean();

  const validAddresses = await getValidTraderAddresses(
    metadatas.map(m => m.address),
    options.limit,
  );

  return validAddresses.map(address => {
    const metadata = metadatas.find(m => m.address === address);

    return {
      address,
      name: _.get(metadata, 'name', null),
    };
  });
};

module.exports = searchTraders;
