const _ = require('lodash');

const formatTokenAmount = require('../tokens/format-token-amount');
const formatTokenType = require('../tokens/format-token-type');
const formatTraderType = require('../traders/format-trader-type');

const transformFee = (tokens, fee) => {
  const token = tokens[fee.tokenAddress];

  return {
    amount: {
      token: formatTokenAmount(_.get(fee, 'amount.token'), token),
      USD: _.get(fee, 'amount.USD'),
    },
    token: {
      address: fee.tokenAddress,
      id: fee.tokenId,
      name: _.get(token, 'name'),
      symbol: _.get(token, 'symbol'),
      type: formatTokenType(_.get(token, 'type')),
    },
    traderType: formatTraderType(fee.traderType),
  };
};

const getFeesForFill = (tokens, fill) =>
  fill.fees === undefined
    ? undefined
    : _.map(fill.fees, fee => transformFee(tokens, fee));

module.exports = getFeesForFill;
