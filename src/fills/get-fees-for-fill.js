const _ = require('lodash');

const formatTokenAmount = require('../tokens/format-token-amount');
const formatTokenType = require('../tokens/format-token-type');
const formatTraderType = require('../traders/format-trader-type');

const transformFee = fee => {
  const tokenAmount = formatTokenAmount(_.get(fee, 'amount.token'), fee.token);

  return {
    amount: !_.isNil(tokenAmount)
      ? {
          token: tokenAmount,
          USD: _.get(fee, 'amount.USD', null),
        }
      : null,
    token: {
      address: fee.tokenAddress,
      id: _.get(fee, 'tokenId', null),
      name: _.get(fee.token, 'name', null),
      symbol: _.get(fee.token, 'symbol', null),
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
