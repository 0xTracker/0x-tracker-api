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
  ARTICLE_SOURCES: {
    '0xproject': {
      name: '0x Team',
      url: 'https://0x.org',
      imageUrl: 'https://resources.0xtracker.com/logos/0x.png',
      slug: '0x',
    },
    '0xvideos': {
      name: '0x YouTube',
      url: 'https://www.youtube.com/channel/UCFrSpPi9WUW9wYTa0Q1sdnA',
      imageUrl: 'https://resources.0xtracker.com/logos/0x.png',
      slug: '0x-youtube',
    },
    '0xtracker': {
      name: '0x Tracker',
      url: 'https://0xtracker.com',
      imageUrl: 'https://resources.0xtracker.com/logos/0x-tracker.png',
      slug: '0x-tracker',
    },
    bambooRelay: {
      relayer: 'bambooRelay',
    },
    boxSwap: {
      relayer: 'boxSwap',
    },
    dYdX: {
      name: 'dYdX',
      url: 'https://dydx.exchange/',
      imageUrl: 'https://resources.0xtracker.com/logos/dydx.png',
      slug: 'dydx',
    },
    emoon: {
      relayer: 'emoon',
    },
    ercdex: { relayer: 'ercDex' },
    ethfinex: {
      name: 'Ethfinex',
      url: 'https://www.ethfinex.com/',
      imageUrl: 'https://resources.0xtracker.com/logos/ethfinex.png',
      slug: 'ethfinex',
    },
    ledgerDex: {
      relayer: 'ledgerDex',
    },
    oc2Dex: {
      relayer: 'oc2Dex',
    },
    openRelay: {
      relayer: 'openRelay',
    },
    paradex: {
      relayer: 'paradex',
    },
    radarrelay: {
      relayer: 'radarRelay',
    },
    theOcean: {
      relayer: 'theOcean',
    },
    tokenlon: {
      relayer: 'tokenlon',
    },
    veil: {
      name: 'Veil',
      url: 'https://veil.co',
      imageUrl: 'https://resources.0xtracker.com/logos/veil.png',
      slug: 'veil',
    },
  },
};
