const _ = require('lodash');

const formatTokenAmount = require('../tokens/format-token-amount');
const formatTokenType = require('../tokens/format-token-type');
const formatTraderType = require('../traders/format-trader-type');

const transformFee = fee => {
  return {
    amount: {
      token: formatTokenAmount(_.get(fee, 'amount.token'), fee.token),
      USD: _.get(fee, 'amount.USD'),
    },
    token: {
      address: fee.tokenAddress,
      id: fee.tokenId,
      name: _.get(fee.token, 'name'),
      symbol: _.get(fee.token, 'symbol'),
      type: formatTokenType(_.get(fee.token, 'type')),
    },
    traderType: formatTraderType(fee.traderType),
  };
};

const getFeesForFill = fill =>
  fill.protocolVersion < 3
    ? undefined
    : _.map(fill.fees, fee => transformFee(fee));

module.exports = getFeesForFill;
