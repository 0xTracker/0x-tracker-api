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
  KNOWN_ASSET_BRIDGES: [
    {
      addresses: [
        '0x6a3b7c553d47c08651641ef00cb3befae97bf415', // V1
        '0x77c31eba23043b9a72d13470f3a3a311344d7438', // V2
      ],
      name: 'Chai',
    },
    {
      addresses: [
        '0x96ddba19b69d6ea2549f6a12d005595167414744', // V1
        '0x55dc8f21d20d4c6ed3c82916a438a413ca68e335', // V2
      ],
      name: 'dYdX',
    },
    {
      addresses: [
        '0x0ac2d6f5f5afc669d3ca38f830dad2b4f238ad3f', // V1
        '0x1c36b06fc0d9354a96cf155b861b141ed10c3312', // V2
        '0xe97ea901d034ba2e018155264f77c417ce7717f9', // V3
        '0xe3379a1956f4a79f39eb2e87bb441419e167538e', // V4
      ],
      name: 'Eth2Dai',
    },
    {
      addresses: [
        '0xe64660275c40c16c491c2dabf50afaded20f858f', // V1
        '0x7253a80c1d3a3175283bad9ed04b2cecad0fe0d3', // V2
        '0xf342f3a80fdc9b48713d58fe97e17f5cc764ee62', // V3
      ],
      name: 'Kyber',
    },
    {
      addresses: [
        '0xa6baaed2053058a3c8f11e0c7a9716304454b09e', // V1
        '0xb0dc61047847732a013ce27341228228a38655a0', // V2
        '0x533344cfdf2a3e911e2cf4c6f5ed08e791f5355f', // V3
      ],
      name: 'Uniswap',
    },
    {
      addresses: [
        '0xe335bdd1fb0ee30f9a9a434f18f8b118dec32df7', // V1
      ],
      name: 'Curve',
    },
  ],
};
