const _ = require('lodash');

const {
  ASSET_TYPE,
  ASSET_TYPE_BY_PROXY,
  TRADER_TYPE,
} = require('../constants');
const formatTokenAmount = require('../tokens/format-token-amount');

// Creates an asset for the given token address and trader type.
// Only applies to fills from 0x v1.
const createAsset = (tokens, fill, tokenAddress, traderType) => {
  const amount =
    traderType === TRADER_TYPE.MAKER ? fill.makerAmount : fill.takerAmount;
  const token = tokens[tokenAddress];

  return {
    amount: amount !== undefined ? formatTokenAmount(amount, token) : undefined,
    tokenAddress,
    tokenSymbol: _.get(token, 'symbol'),
    tokenType: _.get(token, 'name'),
    traderType,
    type: ASSET_TYPE.ERC20,
  };
};

// Transforms a given 0x asset into our preferred shape
const transformAsset = (tokens, fill, asset, traderType) => {
  const amount =
    traderType === TRADER_TYPE.MAKER ? fill.makerAmount : fill.takerAmount;
  const token = tokens[asset.tokenAddress];

  return {
    amount: amount !== undefined ? formatTokenAmount(amount, token) : undefined,
    tokenAddress: asset.tokenAddress,
    tokenId: asset.tokenId,
    tokenSymbol: _.get(token, 'symbol'),
    tokenType: _.get(token, 'name'),
    traderType,
    type: ASSET_TYPE_BY_PROXY[asset.assetProxyId],
  };
};

const getAssetsForFill = (tokens, fill) => {
  const assets = [];

  if (fill.makerAsset !== undefined) {
    assets.push(
      transformAsset(tokens, fill, fill.makerAsset, TRADER_TYPE.MAKER),
      transformAsset(tokens, fill, fill.takerAsset, TRADER_TYPE.TAKER),
    );
  } else if (fill.makerToken !== undefined) {
    // Before 0x v2, fills would have a makerToken and takerToken field. Therefore
    // we need to support that legacy data structure.
    assets.push(
      createAsset(tokens, fill, fill.takerToken, TRADER_TYPE.TAKER),
      createAsset(tokens, fill, fill.makerToken, TRADER_TYPE.MAKER),
    );
  }

  return assets;
};

module.exports = getAssetsForFill;
