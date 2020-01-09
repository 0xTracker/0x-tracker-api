const _ = require('lodash');

const formatFillStatus = require('../../../../fills/format-fill-status');
const formatTokenAmount = require('../../../../tokens/format-token-amount');
const formatTokenType = require('../../../../tokens/format-token-type');
const formatTraderType = require('../../../../traders/format-trader-type');

const transformAsset = (tokens, asset) => {
  const token = tokens[asset.tokenAddress];
  const price = _.get(asset.price, 'USD');

  return {
    amount: formatTokenAmount(asset.amount, token),
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

const transformRelayer = relayer =>
  relayer === undefined ? null : _.pick(relayer, 'slug', 'name', 'imageUrl');

const transformFill = (tokens, relayers, fill) => {
  const assets = transformAssets(tokens, fill);
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
