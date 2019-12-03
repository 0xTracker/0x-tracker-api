const _ = require('lodash');

const { ETH_TOKEN_DECIMALS, ZRX_TOKEN_DECIMALS } = require('../constants');
const formatTokenAmount = require('../tokens/format-token-amount');
const RelayerMetric = require('../model/relayer-metric');

const computeNetworkStatsForDates = async (dateFrom, dateTo) => {
  const baseQuery = {
    date: {
      $gte: dateFrom,
      $lte: dateTo,
    },
  };

  const [fillResults, tradeResults] = await Promise.all([
    RelayerMetric.aggregate([
      {
        $match: baseQuery,
      },
      {
        $group: {
          _id: null,
          feesUSD: {
            $sum: '$fees.USD',
          },
          feesZRX: {
            $sum: '$fees.ZRX',
          },
          fillCount: {
            $sum: '$fillCount',
          },
          fillVolume: {
            $sum: '$fillVolume',
          },
          protocolFeesUSD: {
            $sum: '$protocolFees.USD',
          },
          protocolFeesETH: {
            $sum: '$protocolFees.ETH',
          },
        },
      },
    ]),

    RelayerMetric.aggregate([
      {
        $match: {
          ...baseQuery,
          relayerId: { $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          tradeCount: {
            $sum: '$tradeCount',
          },
          tradeVolume: {
            $sum: '$tradeVolume',
          },
        },
      },
    ]),
  ]);

  return {
    fees: {
      USD: _.get(fillResults, '0.feesUSD', 0),
      ZRX: formatTokenAmount(
        _.get(fillResults, '0.feesZRX', 0),
        ZRX_TOKEN_DECIMALS,
      ),
    },
    fillCount: _.get(fillResults, '0.fillCount', 0),
    fillVolume: _.get(fillResults, '0.fillVolume', 0),
    protocolFees: {
      USD: _.get(fillResults, '0.protocolFeesUSD', 0),
      ETH: formatTokenAmount(
        _.get(fillResults, '0.protocolFeesETH', 0),
        ETH_TOKEN_DECIMALS,
      ),
    },
    tradeCount: _.get(tradeResults, '0.tradeCount', 0),
    tradeVolume: _.get(tradeResults, '0.tradeVolume', 0),
  };
};

module.exports = computeNetworkStatsForDates;
