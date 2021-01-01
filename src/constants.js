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
      name: '0x Labs',
      url: 'https://0x.org',
      imageUrl: 'https://resources.0xtracker.com/logos/0x.png',
      slug: '0x-labs',
    },
    '0xvideos': {
      name: '0x Labs YouTube',
      url: 'https://www.youtube.com/channel/UCFrSpPi9WUW9wYTa0Q1sdnA',
      imageUrl: 'https://resources.0xtracker.com/logos/0x.png',
      slug: '0x-labs-youtube',
    },
    '0xtracker': {
      name: '0x Tracker',
      url: 'https://0xtracker.com',
      imageUrl: 'https://resources.0xtracker.com/logos/0x-tracker.png',
      slug: '0x-tracker',
    },
    bambooRelay: {
      imageUrl: 'https://resources.0xtracker.com/logos/bamboo-relay.png',
      name: 'Bamboo Relay',
      slug: 'bamboo-relay',
      url: '',
    },
    boxSwap: {
      imageUrl: 'https://resources.0xtracker.com/logos/boxswap.png',
      name: 'Box Swap',
      slug: 'box-swap',
      url: '',
    },
    dYdX: {
      name: 'dYdX',
      url: 'https://dydx.exchange/',
      imageUrl: 'https://resources.0xtracker.com/logos/dydx.png',
      slug: 'dydx',
    },
    emoon: {
      imageUrl: 'https://resources.0xtracker.com/logos/emoon.png',
      name: 'Emoon',
      slug: 'emoon',
      url: '',
    },
    ercdex: {
      imageUrl: 'https://resources.0xtracker.com/logos/erc-dex.png',
      name: 'ERC dEX',
      slug: 'erc-dex',
      url: '',
    },
    ethfinex: {
      name: 'Ethfinex',
      url: 'https://www.ethfinex.com/',
      imageUrl: 'https://resources.0xtracker.com/logos/ethfinex.png',
      slug: 'ethfinex',
    },
    ledgerDex: {
      imageUrl: 'https://resources.0xtracker.com/logos/ledger-dex.png',
      name: 'Ledger DEX',
      slug: 'ledger-dex',
      url: '',
    },
    oc2Dex: {
      imageUrl: 'https://resources.0xtracker.com/logos/oc2-dex.png',
      name: 'oc2 DEX',
      slug: 'oc2-dex',
      url: '',
    },
    openRelay: {
      imageUrl: 'https://resources.0xtracker.com/logos/open-relay.png',
      name: 'Open Relay',
      slug: 'open-relay',
      url: '',
    },
    paradex: {
      imageUrl: 'https://resources.0xtracker.com/logos/paradex.png',
      name: 'Paradex',
      slug: 'paradex',
      url: '',
    },
    radarrelay: {
      imageUrl: 'https://resources.0xtracker.com/logos/radar-relay.png',
      name: 'RADAR Relay',
      slug: 'radar-relay',
      url: '',
    },
    theOcean: {
      imageUrl: 'https://resources.0xtracker.com/logos/the-ocean.png',
      name: 'The Ocean',
      slug: 'the-ocean',
      url: '',
    },
    tokenlon: {
      imageUrl: 'https://resources.0xtracker.com/logos/tokenlon.png',
      name: 'Tokenlon',
      slug: 'tokenlon',
      url: '',
    },
    veil: {
      name: 'Veil',
      url: 'https://veil.co',
      imageUrl: 'https://resources.0xtracker.com/logos/veil.png',
      slug: 'veil',
    },
  },
};
