const _ = require('lodash');

const formatTokenAmount = require('../tokens/format-token-amount');
const formatTokenType = require('../tokens/format-token-type');
const formatTraderType = require('../traders/format-trader-type');

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

const getAssetsForFill = (tokens, fill) => {
  const mapAsset = _.partial(transformAsset, tokens);

  return _.map(fill.assets, mapAsset);
};

module.exports = getAssetsForFill;
