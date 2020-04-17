const _ = require('lodash');

const { ETH_TOKEN_DECIMALS } = require('../constants');
const elasticsearch = require('../util/elasticsearch');
const formatTokenAmount = require('../tokens/format-token-amount');

const computeNetworkStatsForDates = async (dateFrom, dateTo) => {
  const results = await elasticsearch.getClient().search({
    index: 'fills',
    body: {
      aggs: {
        fillCount: {
          value_count: { field: '_id' },
        },
        fillVolume: {
          sum: { field: 'value' },
        },
        protocolFeesETH: {
          sum: { field: 'protocolFeeETH' },
        },
        protocolFeesUSD: {
          sum: { field: 'protocolFeeUSD' },
        },
        tradeCount: {
          sum: { field: 'tradeCountContribution' },
        },
        tradeVolume: {
          sum: { field: 'tradeVolume' },
        },
      },
      size: 0,
      query: {
        range: {
          date: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
      },
    },
  });

  const getValue = key => _.get(results.body.aggregations, `${key}.value`);

  return {
    fillCount: getValue('fillCount'),
    fillVolume: getValue('fillVolume'),
    protocolFees: {
      ETH: formatTokenAmount(getValue('protocolFeesETH'), ETH_TOKEN_DECIMALS),
      USD: getValue('protocolFeesUSD'),
    },
    tradeCount: getValue('tradeCount'),
    tradeVolume: getValue('tradeVolume'),
  };
};

module.exports = computeNetworkStatsForDates;
