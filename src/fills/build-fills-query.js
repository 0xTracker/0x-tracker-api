const _ = require('lodash');

/**
 * Build an elasticsearch query to filter fills by a specified date range and set of params.
 * The resulting query object can be provided to an elasticsearch search operation.
 *
 * @param {Date} dateFrom
 * @param {Date} dateTo
 * @param {object} params
 */
const buildFillsQuery = params => {
  const {
    apps,
    bridgeAddress,
    dateFrom,
    dateTo,
    protocolVersion,
    query,
    token,
    trader,
    valueFrom,
    valueTo,
  } = params;

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

  if (_.isFinite(protocolVersion)) {
    filters.push({ term: { protocolVersion } });
  }

  if (_.isString(token)) {
    filters.push({ match_phrase: { 'assets.tokenAddress': token } });
  }

  if (_.isString(trader)) {
    filters.push({
      term: {
        traders: trader,
      },
    });
  }

  if (_.isString(query)) {
    filters.push({
      multi_match: {
        fields: [
          'affiliateAddress',
          'assets.bridgeAddress',
          'assets.tokenAddress',
          'feeRecipient',
          'maker',
          'orderHash',
          'senderAddress',
          'taker',
          'transactionHash',
          'transactionFrom',
          'transactionTo',
        ],
        query,
        type: 'phrase',
      },
    });
  }

  if (_.isString(bridgeAddress)) {
    filters.push({ match_phrase: { 'assets.bridgeAddress': bridgeAddress } });
  }

  if (Array.isArray(apps) && apps.length > 0) {
    filters.push({
      nested: {
        path: 'attributions',
        query: {
          bool: {
            filter: apps.map(appId => ({
              term: {
                'attributions.id': appId,
              },
            })),
          },
        },
      },
    });
  }

  return filters.length === 0 && exclusions.length === 0
    ? undefined
    : {
        bool: { filter: filters, must_not: exclusions },
      };
};

module.exports = buildFillsQuery;
