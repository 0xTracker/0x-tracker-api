const _ = require('lodash');
const moment = require('moment');

const { ETH_TOKEN_DECIMALS } = require('../constants');
const elasticsearch = require('../util/elasticsearch');
const formatTokenAmount = require('../tokens/format-token-amount');

const buildQuery = (
  dateFrom,
  dateTo,
  { address, protocolVersion, relayerId, status, token, valueFrom, valueTo },
) => {
  const filters = [];
  const exclusions = [];

  if (dateFrom !== undefined || dateTo !== undefined) {
    filters.push({
      range: {
        date: {
          gte: dateFrom !== undefined ? dateFrom.toISOString() : undefined,
          lte: dateTo !== undefined ? dateTo.toISOString() : undefined,
        },
      },
    });
  }

  if (valueFrom !== undefined || valueTo !== undefined) {
    filters.push({
      range: {
        value: {
          gte: valueFrom !== undefined ? valueFrom : undefined,
          lte: valueTo !== undefined ? valueTo : undefined,
        },
      },
    });
  }

  if (_.isFinite(relayerId)) {
    filters.push({ term: { relayerId } });
  }

  if (_.isNull(relayerId)) {
    exclusions.push({
      exists: {
        field: 'relayerId',
      },
    });
  }

  if (_.isFinite(protocolVersion)) {
    filters.push({ term: { protocolVersion } });
  }

  if (_.isString(token)) {
    filters.push({ match_phrase: { 'assets.tokenAddress': token } });
  }

  if (_.isString(address)) {
    filters.push({
      multi_match: {
        fields: ['maker', 'taker'],
        query: address,
        type: 'phrase',
      },
    });
  }

  if (_.isNumber(status)) {
    filters.push({ term: { status } });
  }

  return filters.length === 0 && exclusions.length === 0
    ? undefined
    : {
        bool: { filter: filters, must_not: exclusions },
      };
};

const getBasicStatsForDates = async (dateFrom, dateTo, filters) => {
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
      query: buildQuery(dateFrom, dateTo, filters),
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

const getPreviousPeriod = (dateFrom, dateTo) => {
  const diff = moment(dateTo).diff(dateFrom);
  const prevDateTo = moment(dateFrom)
    .subtract('millisecond', 1)
    .toDate();
  const prevDateFrom = moment(prevDateTo)
    .subtract('millisecond', diff)
    .toDate();

  return { prevDateFrom, prevDateTo };
};

const getPercentageChange = (valueA, valueB) => {
  if (valueA === 0) {
    return null;
  }

  return ((valueB - valueA) / valueA) * 100;
};

const computeNetworkStatsForDates = async (dateFrom, dateTo, filters) => {
  const { prevDateFrom, prevDateTo } = getPreviousPeriod(dateFrom, dateTo);

  const specifiedPeriodStats = await getBasicStatsForDates(
    dateFrom,
    dateTo,
    filters,
  );

  const previousPeriodStats = await getBasicStatsForDates(
    prevDateFrom,
    prevDateTo,
    filters,
  );

  return {
    fillCount: specifiedPeriodStats.fillCount,
    fillCountChange: getPercentageChange(
      previousPeriodStats.fillCount,
      specifiedPeriodStats.fillCount,
    ),
    fillVolume: specifiedPeriodStats.fillVolume,
    fillVolumeChange: getPercentageChange(
      previousPeriodStats.fillVolume,
      specifiedPeriodStats.fillVolume,
    ),
    protocolFees: specifiedPeriodStats.protocolFees,
    protocolFeesChange: getPercentageChange(
      previousPeriodStats.protocolFees.USD,
      specifiedPeriodStats.protocolFees.USD,
    ),
    tradeCount: specifiedPeriodStats.tradeCount,
    tradeCountChange: getPercentageChange(
      previousPeriodStats.tradeCount,
      specifiedPeriodStats.tradeCount,
    ),
    tradeVolume: specifiedPeriodStats.tradeVolume,
    tradeVolumeChange: getPercentageChange(
      previousPeriodStats.tradeVolume,
      specifiedPeriodStats.tradeVolume,
    ),
  };
};

module.exports = computeNetworkStatsForDates;
