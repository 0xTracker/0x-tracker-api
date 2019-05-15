const _ = require('lodash');

const CacheEntry = require('../model/cache-entry');

const getNetworkStats = async () => {
  const cacheEntry = await CacheEntry.findOne({ key: 'networkStats.24h' });

  return _.get(cacheEntry, 'data', {
    fees: {
      USD: 0,
      ZRX: '0',
    },
    fills: 0,
    volume: 0,
  });
};

module.exports = getNetworkStats;
