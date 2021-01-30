const _ = require('lodash');
const moment = require('moment');

const AddressMetadata = require('../model/address-metadata');
const elasticsearch = require('../util/elasticsearch');
const getTrader = require('./get-trader');

const getSuggestedTraders = async limit => {
  const response = await elasticsearch.getClient().search({
    index: 'trader_metrics_daily',
    body: {
      aggs: {
        traders: {
          terms: {
            field: 'address',
            order: { tradeVolume: 'desc' },
            size: limit,
          },
          aggs: {
            tradeVolume: {
              sum: {
                field: 'totalTradeVolume',
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
      imageUrl: _.get(addressMetadata, 'imageUrl', null),
      name: _.get(addressMetadata, 'name', null),
    };
  });

  return traders;
};

const getValidTraderAddresses = async (addresses, limit) => {
  const response = await elasticsearch.getClient().search({
    index: 'trader_metrics_daily',
    body: {
      query: {
        terms: {
          address: addresses,
        },
      },
      aggs: {
        traders: {
          terms: {
            field: 'address',
            size: limit,
          },
        },
      },
      size: 0,
    },
  });

  const validAddresses = _.uniq(
    response.body.aggregations.traders.buckets.map(bucket => bucket.key),
  );

  return validAddresses;
};

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

const searchTraders = async (query, options) => {
  if (query === '' || query === null) {
    const traders = await getSuggestedTraders(options.limit);

    return traders;
  }

  const trader = await getTrader(query);

  if (trader !== null) {
    return [trader];
  }

  const metadatas = await AddressMetadata.find({
    name: new RegExp(escapeRegex(query), 'ig'),
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
      imageUrl: _.get(metadata, 'imageUrl', null),
      name: _.get(metadata, 'name', null),
    };
  });
};

module.exports = searchTraders;
