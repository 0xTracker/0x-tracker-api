const _ = require('lodash');

const {
  WETH_TOKEN_DECIMALS,
  ZRX_TOKEN_DECIMALS,
} = require('../../../../constants');
const formatFillStatus = require('../../../../fills/format-fill-status');
const formatTokenAmount = require('../../../../tokens/format-token-amount');
const getAssetsForFill = require('../../../../fills/get-assets-for-fill');
const getFeesForFill = require('../../../../fills/get-fees-for-fill');

const formatRelayer = relayer =>
  relayer === undefined ? null : _.pick(relayer, 'slug', 'name', 'imageUrl');

const transformFill = (tokens, relayers, fill) => {
  const assets = getAssetsForFill(tokens, fill);
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
          ETH: formatTokenAmount(fill.protocolFee, WETH_TOKEN_DECIMALS),
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
