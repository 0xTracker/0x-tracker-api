const _ = require('lodash');
const moment = require('moment');

const { ETH_TOKEN_DECIMALS } = require('../constants');
const elasticsearch = require('../util/elasticsearch');
const formatTokenAmount = require('../tokens/format-token-amount');

const computeNetworkStatsForDates = async (dateFrom, dateTo) => {
  const results = await elasticsearch.getClient().search({
    index: 'fills',
    body: {
      aggs: {
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
            gte: moment
              .utc(dateFrom)
              .startOf('day')
              .toDate(),
            lte: moment
              .utc(dateTo)
              .endOf('day')
              .toDate(),
          },
        },
      },
    },
  });

  const getValue = key => _.get(results.body.aggregations, `${key}.value`);

  return {
    fillCount: results.body.aggregations.doc_count,
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
