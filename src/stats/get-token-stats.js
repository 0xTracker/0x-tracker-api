const _ = require('lodash');
const BigNumber = require('bignumber.js');

const Fill = require('../model/fill');
const formatTokenAmount = require('../tokens/format-token-amount');
const getTokensByAddresses = require('../tokens/get-tokens-by-addresses');

const reduceStats = stats =>
  stats.reduce(
    (acc, stat) => ({
      tokenVolume: acc.tokenVolume.plus(stat.tokenVolume.toString()),
      tradeCount: acc.tradeCount + stat.tradeCount,
      volume: acc.volume + stat.volume,
    }),
    {
      tokenVolume: new BigNumber(0),
      tradeCount: 0,
      volume: 0,
    },
  );

const getTokenStatsForMatch = async (match, halveStats = false) => {
  const results = await Fill.aggregate([
    {
      $match: match,
    },
    {
      $group: {
        _id: {
          makerToken: '$makerToken',
          takerToken: '$takerToken',
        },
        localisedAmount: { $sum: `$conversions.USD.amount` },
        makerAmount: { $sum: '$makerAmount' },
        takerAmount: { $sum: '$takerAmount' },
        tradeCount: { $sum: 1 },
      },
    },
  ]);

  const divisor = halveStats ? 2 : 1;

  const reduced = _(results)
    .map(result => [
      {
        token: result._id.makerToken,
        tokenVolume: result.makerAmount / divisor,
        tradeCount: result.tradeCount / divisor,
        volume: result.localisedAmount / divisor,
      },
      {
        token: result._id.takerToken,
        tokenVolume: result.takerAmount / divisor,
        tradeCount: result.tradeCount / divisor,
        volume: result.localisedAmount / divisor,
      },
    ])
    .flatten()
    .groupBy('token')
    .mapValues(reduceStats)
    .value();

  return reduced;
};

const getTokenStats = async (dateFrom, dateTo, filter) => {
  const orderMatchingRelayerIds = [2, 6];
  const baseQuery = {
    date: { $gte: dateFrom, $lte: dateTo },
  };

  let stats;
  if (_.isNumber(filter.relayerId)) {
    stats = await getTokenStatsForMatch(
      {
        ...baseQuery,
        relayerId: filter.relayerId,
      },
      _.includes(orderMatchingRelayerIds, filter.relayerId),
    );
  } else {
    const regularStats = await getTokenStatsForMatch({
      ...baseQuery,
      $and: [
        { relayerId: { $nin: orderMatchingRelayerIds } },
        { relayerId: { $ne: null } },
      ],
    });
    const orderMatcherStats = await getTokenStatsForMatch(
      {
        ...baseQuery,
        relayerId: { $in: orderMatchingRelayerIds },
      },
      true,
    );

    stats = _.mergeWith(
      {},
      regularStats,
      orderMatcherStats,
      (objValue, srcValue) =>
        _.isPlainObject(objValue)
          ? reduceStats([objValue, srcValue])
          : srcValue,
    );
  }

  const tokenAddresses = _.keys(stats);
  const tokens = getTokensByAddresses(tokenAddresses);

  return _.map(tokens, token => {
    const statsForToken = stats[token.address];

    return {
      token: token.address,
      trades: Math.ceil(statsForToken.tradeCount),
      volume: {
        USD: statsForToken.volume,
        [token.symbol]: formatTokenAmount(
          Math.ceil(statsForToken.tokenVolume),
          token,
        ),
      },
    };
  });
};

module.exports = getTokenStats;
