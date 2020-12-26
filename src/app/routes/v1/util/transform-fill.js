const _ = require('lodash');

const {
  ETH_TOKEN_DECIMALS,
  FILL_ATTRIBUTION_TYPE,
} = require('../../../../constants');
const formatFillAttributionType = require('../../../../fills/format-fill-attribution-type');
const formatFillStatus = require('../../../../fills/format-fill-status');
const formatTokenAmount = require('../../../../tokens/format-token-amount');
const getAssetsForFill = require('../../../../fills/get-assets-for-fill');
const getFeesForFill = require('../../../../fills/get-fees-for-fill');

const getRelayer = fill => {
  const relayerAttribution = fill.attributions.find(
    a => a.type === FILL_ATTRIBUTION_TYPE.RELAYER,
  );

  if (relayerAttribution === undefined) {
    return null;
  }

  return {
    imageUrl: relayerAttribution.entity.logoUrl,
    name: relayerAttribution.entity.name,
    slug: relayerAttribution.entity.urlSlug,
  };
};

const normalizeMetadata = (metadata, address) =>
  !address
    ? null
    : {
        address: _.get(metadata, 'address', address),
        isContract: _.get(metadata, 'isContract', null),
        name: _.get(metadata, 'name', null),
      };

const transformFill = fill => {
  const assets = getAssetsForFill(fill);
  const fees = getFeesForFill(fill);
  const conversions = _.get(fill, `conversions.USD`);
  // const taker = _.get(fill, 'takerMetadata.isContract', false)
  //   ? _.get(fill, 'transaction.from', fill.taker)
  //   : fill.taker;

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
    apps: fill.attributions
      .filter(a =>
        [
          FILL_ATTRIBUTION_TYPE.CONSUMER,
          FILL_ATTRIBUTION_TYPE.RELAYER,
        ].includes(a.type),
      )
      .map(attribution => ({
        id: attribution.entityId,
        logoUrl: attribution.entity.logoUrl,
        name: attribution.entity.name,
        type: formatFillAttributionType(attribution.type),
        urlSlug: attribution.entity.urlSlug,
      })),
    assets,
    date: fill.date,
    fees,
    feeRecipient: fill.feeRecipient,
    id: fill.id,
    makerAddress: fill.maker,
    maker: normalizeMetadata(fill.makerMetadata, fill.maker),
    orderHash: fill.orderHash,
    protocolFee,
    protocolVersion: fill.protocolVersion,
    relayer: getRelayer(fill),
    senderAddress: fill.senderAddress,
    sender: normalizeMetadata(fill.senderMetadata, fill.senderAddress),
    status: formatFillStatus(fill.status),
    takerAddress: fill.taker,
    taker: normalizeMetadata(fill.takerMetadata, fill.taker),
    transactionHash: fill.transactionHash,
    value: _.has(conversions, 'amount')
      ? {
          USD: _.get(conversions, 'amount'),
        }
      : undefined,
  };
};

module.exports = transformFill;
