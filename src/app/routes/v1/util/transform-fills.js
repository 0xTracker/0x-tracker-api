const _ = require('lodash');

const {
  ETH_TOKEN_DECIMALS,
  FILL_ATTRIBUTION_TYPE,
} = require('../../../../constants');
const formatFillAttributionType = require('../../../../fills/format-fill-attribution-type');
const formatFillStatus = require('../../../../fills/format-fill-status');
const formatTokenAmount = require('../../../../tokens/format-token-amount');
const getAssetsForFill = require('../../../../fills/get-assets-for-fill');

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

const transformFill = fill => {
  const assets = getAssetsForFill(fill);
  const conversions = _.get(fill, `conversions.USD`);

  const protocolFee =
    fill.protocolFee !== undefined
      ? {
          ETH: formatTokenAmount(fill.protocolFee, ETH_TOKEN_DECIMALS),
          USD: _.get(conversions, 'protocolFee'),
        }
      : undefined;

  return {
    apps: fill.attributions
      .filter(a =>
        [
          FILL_ATTRIBUTION_TYPE.CONSUMER,
          FILL_ATTRIBUTION_TYPE.RELAYER,
        ].includes(a.type),
      )
      .map(a => ({
        id: a.entity.id,
        logoUrl: a.entity.logoUrl,
        name: a.entity.name,
        type: formatFillAttributionType(a.type),
        urlSlug: a.entity.urlSlug,
      })),
    assets,
    date: fill.date,
    feeRecipient: fill.feeRecipient,
    id: fill.id,
    makerAddress: fill.maker || null,
    protocolFee,
    protocolVersion: fill.protocolVersion,
    relayer: getRelayer(fill),
    status: formatFillStatus(fill.status),
    takerAddress: fill.taker,
    value: _.has(conversions, 'amount')
      ? {
          USD: _.get(conversions, 'amount'),
        }
      : undefined,
  };
};

const transformFills = fills => fills.map(fill => transformFill(fill));

module.exports = transformFills;
