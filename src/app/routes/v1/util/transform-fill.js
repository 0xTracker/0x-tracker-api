const _ = require('lodash');

const { FILL_STATUS, ZRX_TOKEN_ADDRESS } = require('../../../../constants');
const formatTokenAmount = require('../../../../tokens/format-token-amount');
const getRelayerForFill = require('../../../../fills/get-relayer-for-fill');

const formatRelayer = relayer =>
  relayer === null ? null : _.pick(relayer, 'slug', 'name', 'imageUrl');

const formatToken = token =>
  _.isString(token)
    ? { address: token }
    : {
        address: token.address,
        name: token.name,
        symbol: token.symbol,
      };

const formatFillStatus = status =>
  _.findKey(FILL_STATUS, value => status === value).toLowerCase();

const transformFill = (fill, tokens) => {
  const conversions = _.get(fill, `conversions.USD`);
  const makerToken = tokens[fill.makerToken] || fill.makerToken;
  const relayer = getRelayerForFill(fill);
  const takerToken = tokens[fill.takerToken] || fill.takerToken;
  const zrxToken = tokens[ZRX_TOKEN_ADDRESS];

  const makerFee = {
    USD: _.get(conversions, 'makerFee'),
    ZRX: formatTokenAmount(fill.makerFee, zrxToken),
  };
  const takerFee = {
    USD: _.get(conversions, 'takerFee'),
    ZRX: formatTokenAmount(fill.takerFee, zrxToken),
  };
  const totalFees = {
    USD: makerFee.USD + takerFee.USD,
    ZRX: makerFee.ZRX === null ? null : makerFee.ZRX.plus(takerFee.ZRX),
  };

  return {
    amount: {
      USD: _.get(fill, `conversions.USD.amount`),
    },
    date: fill.date,
    feeRecipient: fill.feeRecipient,
    id: fill.id,
    makerAddress: fill.maker,
    makerAmount: formatTokenAmount(fill.makerAmount, makerToken),
    makerFee,
    makerPrice: {
      USD: _.get(conversions, 'makerPrice'),
    },
    makerToken: formatToken(makerToken),
    orderHash: fill.orderHash,
    protocolVersion: fill.protocolVersion,
    relayer: formatRelayer(relayer),
    status: formatFillStatus(fill.status),
    takerAddress: fill.taker,
    takerAmount: formatTokenAmount(fill.takerAmount, takerToken),
    takerFee,
    takerPrice: {
      USD: _.get(conversions, 'takerPrice'),
    },
    takerToken: formatToken(takerToken),
    totalFees,
    transactionHash: fill.transactionHash,
  };
};

module.exports = transformFill;
