const _ = require('lodash');
const moment = require('moment');

const { ETH_TOKEN_DECIMALS } = require('../constants');
const elasticsearch = require('../util/elasticsearch');
const formatTokenAmount = require('../tokens/format-token-amount');

const computeNetworkStatsForDates = async (dateFrom, dateTo) => {
  const results = await elasticsearch.getClient().search({
    index: 'network_metrics_hourly',
    body: {
      aggs: {
        fillCount: {
          sum: { field: 'fillCount' },
        },
        fillVolume: {
          sum: { field: 'fillVolume' },
        },
        protocolFeesETH: {
          sum: { field: 'protocolFeesETH' },
        },
        protocolFeesUSD: {
          sum: { field: 'protocolFeesUSD' },
        },
        tradeCount: {
          sum: { field: 'tradeCount' },
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
