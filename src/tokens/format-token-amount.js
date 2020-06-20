const _ = require('lodash');
const { BigNumber } = require('@0xproject/utils');
const { Web3Wrapper } = require('@0xproject/web3-wrapper');

module.exports = (amount, tokenOrDecimals) => {
  if (amount === 0) {
    return new BigNumber(0);
  }

  if (
    (_.get(tokenOrDecimals, 'decimals') === undefined &&
      !_.isNumber(tokenOrDecimals)) ||
    _.isUndefined(amount)
  ) {
    return undefined;
  }

  if (_.isNull(amount)) {
    return null;
  }

  const decimals = _.isNumber(tokenOrDecimals)
    ? tokenOrDecimals
    : tokenOrDecimals.decimals;

  const bigNumber = new BigNumber(amount.toString());

  return Web3Wrapper.toUnitAmount(bigNumber, decimals);
};
