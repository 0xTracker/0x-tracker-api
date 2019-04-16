const _ = require('lodash');

const {
  FILL_STATUS,
  TRADER_TYPE,
  ZRX_TOKEN_ADDRESS,
} = require('../../../../constants');
const formatTokenAmount = require('../../../../tokens/format-token-amount');
const getAssetsForFill = require('../../../../fills/get-assets-for-fill');

const formatRelayer = relayer =>
  relayer === undefined ? null : _.pick(relayer, 'slug', 'name', 'imageUrl');

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

const transformFill = (tokens, relayers, fill) => {
  const assets = getAssetsForFill(tokens, fill);
  const makerAsset = _.find(assets, { traderType: TRADER_TYPE.MAKER });
  const takerAsset = _.find(assets, { traderType: TRADER_TYPE.TAKER });
  const makerToken = tokens[makerAsset.tokenAddress] || makerAsset.tokenAddress;
  const takerToken = tokens[takerAsset.tokenAddress] || takerAsset.tokenAddress;
  const conversions = _.get(fill, `conversions.USD`);
  const fillRelayer = _.find(relayers, { lookupId: fill.relayerId });
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
    assets,
    date: fill.date,
    feeRecipient: fill.feeRecipient,
    id: fill.id,
    makerAddress: fill.maker,
    makerAmount: formatTokenAmount(fill.makerAmount, makerToken), // TODO: Deprecate in favor of assets
    makerFee,
    makerPrice: {
      USD: _.get(conversions, 'makerPrice'),
    },
    makerToken: formatToken(makerToken), // TODO: Deprecate in favor of assets
    orderHash: fill.orderHash,
    protocolVersion: fill.protocolVersion,
    relayer: formatRelayer(fillRelayer),
    senderAddress: fill.senderAddress,
    status: formatFillStatus(fill.status),
    takerAddress: fill.taker,
    takerAmount: formatTokenAmount(fill.takerAmount, takerToken), // TODO: Deprecate in favor of assets
    takerFee,
    takerPrice: {
      USD: _.get(conversions, 'takerPrice'),
    },
    takerToken: formatToken(takerToken), // TODO: Deprecate in favor of assets
    totalFees,
    transactionHash: fill.transactionHash,
    value: {
      USD: _.get(fill, `conversions.USD.amount`),
    },
  };
};

module.exports = transformFill;
