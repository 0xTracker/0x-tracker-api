const _ = require('lodash');

const CacheEntry = require('../model/cache-entry');

const getRelayerStats = async () => {
  const cacheEntry = await CacheEntry.findOne({ key: 'relayerStats.24h' });

  return _.get(cacheEntry, 'data', {
    fees: {
      USD: 0,
      ZRX: '0',
    },
    trades: 0,
    tradeVolume: 0,
  });
};

module.exports = getRelayerStats;
