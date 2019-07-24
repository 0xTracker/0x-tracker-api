const _ = require('lodash');

const { FILL_ACTOR, TOKEN_TYPE, TRADER_TYPE } = require('../constants');
const formatTokenAmount = require('../tokens/format-token-amount');

const TOKEN_TYPE_LABELS = {
  [TOKEN_TYPE.ERC20]: 'erc-20',
  [TOKEN_TYPE.ERC721]: 'erc-721',
};

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
    traderType:
      asset.actor === FILL_ACTOR.MAKER ? TRADER_TYPE.MAKER : TRADER_TYPE.TAKER,
    type: TOKEN_TYPE_LABELS[_.get(token, 'type')],
  };
};

const getAssetsForFill = (tokens, fill) => {
  const mapAsset = _.partial(transformAsset, tokens);

  return _.map(fill.assets, mapAsset);
};

module.exports = getAssetsForFill;
