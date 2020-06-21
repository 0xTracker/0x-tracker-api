const _ = require('lodash');

const { ZRX_TOKEN_DECIMALS } = require('../constants');
const formatTokenAmount = require('../tokens/format-token-amount');
const formatTokenType = require('../tokens/format-token-type');
const formatTraderType = require('../traders/format-trader-type');

const transformFee = fee => {
  const tokenAmount = formatTokenAmount(_.get(fee, 'amount.token'), fee.token);

  return {
    amount: {
      token: tokenAmount,
      USD: _.get(fee, 'amount.USD', null),
    },
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

const ZRX_TOKEN = {
  address: '0xe41d2489571d322189246dafa5ebde1f4699f498',
  id: null,
  name: '0x Protocol Token',
  symbol: 'ZRX',
  type: 'erc-20',
};

const getFeesForFill = fill => {
  const conversions = _.get(fill, `conversions.USD`, {});
  const makerFee = _.get(fill, 'makerFee', 0);
  const takerFee = _.get(fill, 'takerFee', 0);

  if (makerFee > 0 || takerFee > 0) {
    return _.compact([
      makerFee === 0
        ? undefined
        : {
            amount: {
              token: formatTokenAmount(makerFee, ZRX_TOKEN_DECIMALS),
              USD: _.get(conversions, 'makerFee'),
            },
            token: ZRX_TOKEN,
            traderType: 'maker',
          },
      takerFee === 0
        ? undefined
        : {
            amount: {
              token: formatTokenAmount(takerFee, ZRX_TOKEN_DECIMALS),
              USD: _.get(conversions, 'takerFee'),
            },
            token: ZRX_TOKEN,
            traderType: 'taker',
          },
    ]);
  }

  return _.get(fill, 'fees', [])
    .filter(fee => fee.amount.token > 0)
    .map(transformFee);
};

module.exports = getFeesForFill;
