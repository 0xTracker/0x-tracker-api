const _ = require('lodash');
const BigNumber = require('bignumber.js');

const getRelayerStats = require('./get-relayer-stats');

const getNetworkStats = async (dateFrom, dateTo) => {
  const relayerStats = await getRelayerStats(dateFrom, dateTo);
  const stats = _.reduce(
    relayerStats,
    (acc, stat) => ({
      fees: {
        USD: acc.fees.USD + stat.fees.USD,
        ZRX: acc.fees.ZRX.plus(stat.fees.ZRX.toString()),
      },
      trades: acc.trades + stat.trades,
      volume: acc.volume + stat.volume,
    }),
    {
      fees: { USD: 0, ZRX: new BigNumber(0) },
      trades: 0,
      volume: 0,
    },
  );

  return stats;
};

module.exports = getNetworkStats;
