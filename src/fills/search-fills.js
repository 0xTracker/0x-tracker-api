const _ = require('lodash');

const Fill = require('../model/fill');

const getFilterForParams = params => {
  const { address, protocolVersion, query, relayerId, token } = params;

  if (_.isString(query)) {
    return {
      $or: [
        { feeRecipient: query },
        { maker: query },
        { orderHash: query },
        { taker: query },
        { transactionHash: query },
        { senderAddress: query },
      ],
    };
  }

  if (_.isString(token)) {
    return {
      'assets.tokenAddress': token,
    };
  }

  if (_.isString(address)) {
    return {
      $or: [{ maker: address }, { taker: address }],
    };
  }

  if (_.isNumber(relayerId)) {
    return {
      relayerId,
    };
  }

  if (_.isFinite(protocolVersion)) {
    return { protocolVersion };
  }

  return {};
};

const buildFilter = params => {
  return _.pickBy(
    {
      date:
        params.dateFrom !== undefined ? { $gte: params.dateFrom } : undefined,
      ...getFilterForParams(params),
    },
    value => value !== undefined,
  );
};

const searchFills = (params, options) => {
  const filter = buildFilter(params);

  return Fill.paginate(filter, {
    sort: { date: -1 },
    lean: true,
    limit: options.limit,
    page: options.page,
  });
};

module.exports = searchFills;
