const _ = require('lodash');

const {
  FILL_STATUS,
  WETH_TOKEN_ADDRESS,
  ZRX_TOKEN_ADDRESS,
} = require('../../../../constants');
const formatTokenAmount = require('../../../../tokens/format-token-amount');
const getAssetsForFill = require('../../../../fills/get-assets-for-fill');

const formatRelayer = relayer =>
  relayer === undefined ? null : _.pick(relayer, 'slug', 'name', 'imageUrl');

const formatFillStatus = status =>
  _.findKey(FILL_STATUS, value => status === value).toLowerCase();

const transformFill = (tokens, relayers, fill) => {
  const assets = getAssetsForFill(tokens, fill);
  const conversions = _.get(fill, `conversions.USD`);
  const fillRelayer = _.find(relayers, { lookupId: fill.relayerId });
  const wethToken = tokens[WETH_TOKEN_ADDRESS];
  const zrxToken = tokens[ZRX_TOKEN_ADDRESS];

  const makerFee =
    fill.makerFee !== undefined
      ? {
          USD: _.get(conversions, 'makerFee'),
          ZRX: formatTokenAmount(fill.makerFee, zrxToken),
        }
      : null;

  const takerFee =
    fill.takerFee !== undefined
      ? {
          USD: _.get(conversions, 'takerFee'),
          ZRX: formatTokenAmount(fill.takerFee, zrxToken),
        }
      : null;

  const totalFees =
    takerFee !== null || makerFee !== null
      ? {
          USD: makerFee.USD + takerFee.USD,
          ZRX:
            makerFee.ZRX === undefined
              ? undefined
              : makerFee.ZRX.plus(takerFee.ZRX),
        }
      : undefined;

  const protocolFee =
    fill.protocolFee !== undefined && wethToken !== undefined
      ? {
          ETH: formatTokenAmount(fill.protocolFee, wethToken),
          USD: _.get(conversions, 'protocolFee'),
        }
      : undefined;

  return {
    assets,
    date: fill.date,
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
