const _ = require('lodash');

const { ETH_TOKEN_DECIMALS } = require('../../../../constants');
const formatFillStatus = require('../../../../fills/format-fill-status');
const formatTokenAmount = require('../../../../tokens/format-token-amount');
const getAssetsForFill = require('../../../../fills/get-assets-for-fill');
const getFeesForFill = require('../../../../fills/get-fees-for-fill');

const formatRelayer = relayer =>
  relayer === null ? null : _.pick(relayer, 'slug', 'name', 'imageUrl');

const transformFill = fill => {
  const assets = getAssetsForFill(fill);
  const fees = getFeesForFill(fill);
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
    affiliate: _.isNil(fill.affiliateAddress)
      ? null
      : {
          address: fill.affiliateAddress,
          imageUrl: _.get(fill, 'affiliate.imageUrl', null),
          name: _.get(fill, 'affiliate.name', null),
        },
    assets,
    date: fill.date,
    fees,
    feeRecipient: fill.feeRecipient,
    id: fill.id,
    makerAddress: fill.maker,
    orderHash: fill.orderHash,
    protocolFee,
    protocolVersion: fill.protocolVersion,
    relayer: formatRelayer(fill.relayer),
    senderAddress: fill.senderAddress,
    status: formatFillStatus(fill.status),
    takerAddress: taker,
    transactionHash: fill.transactionHash,
    value: _.has(conversions, 'amount')
      ? {
          USD: _.get(conversions, 'amount'),
        }
      : undefined,
  };
};

module.exports = transformFill;
