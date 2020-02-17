const _ = require('lodash');

const elasticsearch = require('../util/elasticsearch');
const Fill = require('../model/fill');

const buildQuery = ({
  address,
  bridgeAddress,
  bridged,
  dateFrom,
  dateTo,
  protocolVersion,
  query,
  relayerId,
  status,
  token,
  valueFrom,
  valueTo,
}) => {
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

  if (_.isString(query)) {
    filters.push({
      multi_match: {
        fields: [
          'feeRecipient',
          'maker',
          'orderHash',
          'senderAddress',
          'taker',
          'transactionHash',
        ],
        query,
        type: 'phrase',
      },
    });
  }

  if (_.isNumber(status)) {
    filters.push({ term: { status } });
  }

  if (_.isString(bridgeAddress)) {
    filters.push({ match_phrase: { 'assets.bridgeAddress': bridgeAddress } });
  }

  if (_.isBoolean(bridged)) {
    if (bridged) {
      filters.push({
        exists: {
          field: 'assets.bridgeAddress',
        },
      });
    } else {
      exclusions.push({
        exists: {
          field: 'assets.bridgeAddress',
        },
      });
    }
  }

  return filters.length === 0
    ? undefined
    : {
        bool: { filter: filters, must_not: exclusions },
      };
};

const searchFills = async (params, options) => {
  const results = await elasticsearch.getClient().search({
    index: 'fills',
    body: {
      _source: false,
      from: (options.page - 1) * options.limit,
      query: buildQuery(params),
      size: options.limit,
      sort: [{ date: 'desc' }],
      track_total_hits: true,
    },
  });

  const resultCount = results.body.hits.total.value;
  const fillIds = results.body.hits.hits.map(hit => hit._id);
  const fills = await Fill.find({ _id: { $in: fillIds } })
    .populate([
      { path: 'relayer', select: 'imageUrl name slug' },
      { path: 'assets.token', select: 'decimals name symbol type' },
      { path: 'fees.token', select: 'decimals name symbol type' },
    ])
    .sort({ date: -1 });

  return {
    docs: fills,
    pages: Math.ceil(resultCount / options.limit),
    total: resultCount,
  };
};

module.exports = searchFills;
