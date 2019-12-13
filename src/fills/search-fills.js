const _ = require('lodash');

const elasticsearch = require('../util/elasticsearch');
const Fill = require('../model/fill');

const buildQuery = ({
  address,
  dateFrom,
  protocolVersion,
  query,
  relayerId,
  token,
}) => {
  const filters = [];

  if (dateFrom !== undefined) {
    filters.push({ range: { date: { gte: dateFrom.toISOString() } } });
  }

  if (_.isFinite(relayerId)) {
    filters.push({ term: { relayerId } });
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

  return filters.length === 0
    ? undefined
    : {
        bool: { filter: filters },
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
  const fills = await Fill.find({ _id: { $in: fillIds } }).sort({ date: -1 });

  return {
    docs: fills,
    pages: Math.ceil(resultCount / options.limit),
    total: resultCount,
  };
};

module.exports = searchFills;
