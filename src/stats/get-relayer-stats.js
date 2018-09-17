const _ = require('lodash');

const { ZRX_TOKEN_ADDRESS } = require('../constants');
const Fill = require('../model/fill');
const formatTokenAmount = require('../tokens/format-token-amount');
const getAllRelayers = require('../relayers/get-all-relayers');
const getTokens = require('../tokens/get-tokens');

const getRelayerStats = async (dateFrom, dateTo) => {
  const metrics = await Fill.aggregate([
    {
      $match: {
        date: { $gte: new Date(dateFrom), $lte: new Date(dateTo) },
        relayerId: { $ne: null },
      },
    },
    {
      $group: {
        _id: {
          relayerId: `$relayerId`,
        },
        localisedMakerFees: { $sum: `$conversions.USD.makerFee` },
        localisedTakerFees: { $sum: `$conversions.USD.takerFee` },
        makerFee: { $sum: '$makerFee' },
        takerFee: { $sum: 'takerFee' },
        tradeCount: { $sum: 1 },
        volume: { $sum: `$conversions.USD.amount` },
      },
    },
  ]);

  const relayers = getAllRelayers();
  const tokens = await getTokens();
  const zrxToken = tokens[ZRX_TOKEN_ADDRESS];

  const stats = _.mapValues(relayers, (relayer, relayerId) => {
    const metric = _.find(metrics, { _id: { relayerId: relayer.lookupId } });

    if (_.isUndefined(metric)) {
      return { fees: { USD: 0, ZRX: 0 }, tradeCount: 0, volume: 0 };
    }

    const {
      localisedMakerFees,
      localisedTakerFees,
      makerFee,
      takerFee,
      tradeCount,
      volume,
    } = metric;

    const stat = {
      fees: {
        USD: localisedMakerFees + localisedTakerFees,
        ZRX: formatTokenAmount(makerFee + takerFee, zrxToken),
      },
      tradeCount,
      volume,
    };

    if (_.includes(['paradex', 'ddex', 'theOcean', 'starBit'], relayerId)) {
      return {
        fees: stat.fees,
        tradeCount: Math.ceil(stat.tradeCount / 2),
        volume: stat.volume / 2,
      };
    }

    return stat;
  });

  return stats;
};

module.exports = getRelayerStats;