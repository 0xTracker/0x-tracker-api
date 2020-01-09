const _ = require('lodash');

const {
  ETH_TOKEN_DECIMALS,
  ZRX_TOKEN_DECIMALS,
} = require('../../../../constants');
const formatFillStatus = require('../../../../fills/format-fill-status');
const formatTokenAmount = require('../../../../tokens/format-token-amount');
const formatTokenType = require('../../../../tokens/format-token-type');
const formatTraderType = require('../../../../traders/format-trader-type');
const getAssetBridgeName = require('../../../../fills/get-asset-bridge-name');
const getFeesForFill = require('../../../../fills/get-fees-for-fill');

const transformAsset = (tokens, asset) => {
  const token = tokens[asset.tokenAddress];
  const price = _.get(asset.price, 'USD');

  return {
    amount: formatTokenAmount(asset.amount, token),
    bridgeAddress: asset.bridgeAddress,
    bridgeName: getAssetBridgeName(asset.bridgeAddress),
    price: _.isNumber(price) ? { USD: price } : undefined,
    tokenAddress: asset.tokenAddress,
    tokenId: asset.tokenId,
    tokenSymbol: _.get(token, 'symbol'),
    tokenType: _.get(token, 'name'),
    traderType: formatTraderType(asset.actor),
    type: formatTokenType(_.get(token, 'type')),
  };
};

const transformAssets = (tokens, fill) => {
  const mapAsset = _.partial(transformAsset, tokens);

  return _.map(fill.assets, mapAsset);
};

const formatRelayer = relayer =>
  relayer === undefined ? null : _.pick(relayer, 'slug', 'name', 'imageUrl');

const transformFill = (tokens, relayers, fill) => {
  const assets = transformAssets(tokens, fill);
  const fees = getFeesForFill(tokens, fill);
  const conversions = _.get(fill, `conversions.USD`);
  const fillRelayer = _.find(relayers, { lookupId: fill.relayerId });

  const makerFee =
    fill.makerFee !== undefined
      ? {
          USD: _.get(conversions, 'makerFee'),
          ZRX: formatTokenAmount(fill.makerFee, ZRX_TOKEN_DECIMALS),
        }
      : undefined;

  const takerFee =
    fill.takerFee !== undefined
      ? {
          USD: _.get(conversions, 'takerFee'),
          ZRX: formatTokenAmount(fill.takerFee, ZRX_TOKEN_DECIMALS),
        }
      : undefined;

  const totalFees =
    takerFee !== undefined || makerFee !== undefined
      ? {
          USD: makerFee.USD + takerFee.USD,
          ZRX:
            makerFee.ZRX === undefined
              ? undefined
              : makerFee.ZRX.plus(takerFee.ZRX),
        }
      : undefined;

  const protocolFee =
    fill.protocolFee !== undefined
      ? {
          ETH: formatTokenAmount(fill.protocolFee, ETH_TOKEN_DECIMALS),
          USD: _.get(conversions, 'protocolFee'),
        }
      : undefined;

  return {
    assets,
    date: fill.date,
    fees,
    feeRecipient: fill.feeRecipient,
    id: fill.id,
    makerAddress: fill.maker,
    makerFee,
    orderHash: fill.orderHash,
    protocolFee,
    protocolVersion: fill.protocolVersion,
    relayer: formatRelayer(fillRelayer),
    senderAddress: fill.senderAddress,
    status: formatFillStatus(fill.status),
    takerAddress: fill.taker,
    takerFee,
    totalFees,
    transactionHash: fill.transactionHash,
    value: _.has(conversions, 'amount')
      ? {
          USD: _.get(conversions, 'amount'),
        }
      : undefined,
  };
};

module.exports = transformFill;
