const { AssetProxyId } = require('@0x/types');

const ASSET_TYPE = {
  ERC20: 'erc-20',
  ERC721: 'erc-721',
};

module.exports = {
  ASSET_TYPE,
  ASSET_TYPE_BY_PROXY: {
    [AssetProxyId.ERC20]: ASSET_TYPE.ERC20,
    [AssetProxyId.ERC721]: ASSET_TYPE.ERC721,
  },
  FILL_ACTOR: {
    MAKER: 0,
    TAKER: 1,
  },
  TOKEN_TYPE: {
    ERC20: 0,
    ERC721: 1,
    ERC1155: 2,
  },
  TRADER_TYPE: {
    MAKER: 0,
    TAKER: 1,
  },
  FILL_ATTRIBUTION_TYPE: {
    RELAYER: 0,
    CONSUMER: 1,
  },
  FILL_STATUS: {
    FAILED: 2,
    PENDING: 0,
    SUCCESSFUL: 1,
  },
  GENESIS_DATE: new Date('2017-08-15T00:00:00.000Z'),
  GRANULARITY: {
    DAY: 'day',
    HOUR: 'hour',
    MONTH: 'month',
    WEEK: 'week',
  },
  TIME_PERIOD: {
    DAY: 'day',
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year',
    ALL: 'all',
  },
  ETH_TOKEN_DECIMALS: 18,
  ZRX_TOKEN_DECIMALS: 18,
};
