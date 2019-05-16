const _ = require('lodash');

const Fill = require('../model/fill');

const searchFills = ({ address, limit, page, query, relayerId, token }) => {
  let filter = {};

  if (_.isString(query)) {
    filter = {
      $or: [
        { feeRecipient: query },
        { maker: query },
        { orderHash: query },
        { taker: query },
        { transactionHash: query },
        { senderAddress: query },
      ],
    };
  } else if (_.isString(token)) {
    filter = {
      $or: [{ makerToken: token }, { takerToken: token }],
    };
  } else if (_.isString(address)) {
    filter = {
      $or: [{ maker: address }, { taker: address }],
    };
  } else if (_.isNumber(relayerId)) {
    filter = {
      relayerId,
    };
  }

  return Fill.paginate(filter, {
    sort: { date: -1 },
    lean: true,
    limit,
    page,
  });
};

module.exports = searchFills;
