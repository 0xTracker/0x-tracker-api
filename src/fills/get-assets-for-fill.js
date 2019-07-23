const _ = require('lodash');

const { ASSET_TYPE, FILL_ACTOR, TRADER_TYPE } = require('../constants');
const formatTokenAmount = require('../tokens/format-token-amount');

const transformAsset = (tokens, asset) => {
  const token = tokens[asset.tokenAddress];

  return {
    amount: formatTokenAmount(asset.amount, token),
    price: asset.price,
    tokenAddress: asset.tokenAddress,
    tokenId: asset.tokenId,
    tokenSymbol: _.get(token, 'symbol'),
    tokenType: _.get(token, 'name'),
    traderType:
      asset.actor === FILL_ACTOR.MAKER ? TRADER_TYPE.MAKER : TRADER_TYPE.TAKER,
    type: ASSET_TYPE.ERC20, // TODO: Store against tokens so this value can be looked up
  };
};

const getAssetsForFill = (tokens, fill) => {
  const mapAsset = _.partial(transformAsset, tokens);

  return _.map(fill.assets, mapAsset);
};

module.exports = getAssetsForFill;
