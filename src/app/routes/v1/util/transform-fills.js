const _ = require('lodash');

const { ETH_TOKEN_DECIMALS } = require('../../../../constants');
const formatFillStatus = require('../../../../fills/format-fill-status');
const formatTokenAmount = require('../../../../tokens/format-token-amount');
const getAssetsForFill = require('../../../../fills/get-assets-for-fill');

const transformRelayer = relayer =>
  relayer === null ? null : _.pick(relayer, 'slug', 'name', 'imageUrl');

const transformFill = fill => {
  const assets = getAssetsForFill(fill);
  const conversions = _.get(fill, `conversions.USD`);
  const taker = _.get(fill, 'takerMetadata.isContract', false)
    ? _.get(fill, 'transaction.from', fill.taker)
    : fill.taker;

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
    feeRecipient: fill.feeRecipient,
    id: fill.id,
    makerAddress: fill.maker,
    protocolFee,
    protocolVersion: fill.protocolVersion,
    relayer: transformRelayer(fill.relayer),
    status: formatFillStatus(fill.status),
    takerAddress: taker,
    value: _.has(conversions, 'amount')
      ? {
          USD: _.get(conversions, 'amount'),
        }
      : undefined,
  };
};

const transformFills = fills => fills.map(fill => transformFill(fill));

module.exports = transformFills;
