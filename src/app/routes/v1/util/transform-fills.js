const _ = require('lodash');

const formatFillStatus = require('../../../../fills/format-fill-status');
const getAssetsForFill = require('../../../../fills/get-assets-for-fill');

const transformRelayer = relayer =>
  relayer === undefined ? null : _.pick(relayer, 'slug', 'name', 'imageUrl');

const transformFill = (tokens, relayers, fill) => {
  const assets = getAssetsForFill(tokens, fill);
  const conversions = _.get(fill, `conversions.USD`);
  const fillRelayer = _.find(relayers, { lookupId: fill.relayerId });

  return {
    assets,
    date: fill.date,
    feeRecipient: fill.feeRecipient,
    id: fill.id,
    makerAddress: fill.maker,
    relayer: transformRelayer(fillRelayer),
    status: formatFillStatus(fill.status),
    takerAddress: fill.taker,
    value: _.has(conversions, 'amount')
      ? {
          USD: _.get(conversions, 'amount'),
        }
      : undefined,
  };
};

const transformFills = (tokens, relayers, fills) =>
  fills.map(fill => transformFill(tokens, relayers, fill));

module.exports = transformFills;
