module.exports = {
  FILL_STATUS: {
    FAILED: 2,
    PENDING: 0,
    SUCCESSFUL: 1,
  },
  GENESIS_DATE: new Date('2017-08-15T00:00:00.000Z'),
  METRIC_INTERVAL: {
    DAY: 'day',
    HALF_HOUR: 'halfHour',
    HOUR: 'hour',
  },
  TIME_PERIOD: {
    DAY: 'day',
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year',
    ALL: 'all',
  },
  ZRX_TOKEN_ADDRESS: '0xe41d2489571d322189246dafa5ebde1f4699f498',
  ARTICLE_SOURCES: {
    '0xproject': {
      name: '0x',
      url: 'https://0x.org',
      imageUrl: 'https://0xtracker.com/assets/logos/0x.png',
      slug: '0x',
    },
    amadeus: {
      name: 'Amadeus Relay',
      url: 'https://amadeusrelay.org/',
      imageUrl: 'https://0xtracker.com/assets/logos/amadeus-relay.png',
      slug: 'amadeus-relay',
    },
    ddex: { name: 'DDEX', url: 'https://ddex.io/', relayer: 'ddex' },
    dharma: {
      name: 'Dharma',
      url: 'https://dharma.io/',
      imageUrl: 'https://0xtracker.com/assets/logos/dharma.png',
      slug: 'dharma',
    },
    dYdX: {
      name: 'dYdX',
      url: 'https://dydx.exchange/',
      imageUrl: 'https://0xtracker.com/assets/logos/dydx.png',
      slug: 'dydx',
    },
    ercdex: { name: 'ERC dEX', url: 'https://ercdex.com/', relayer: 'ercDex' },
    ethfinex: {
      name: 'Ethfinex',
      url: 'https://www.ethfinex.com/',
      imageUrl: 'https://0xtracker.com/assets/logos/ethfinex.png',
      slug: 'ethfinex',
    },
    kinalpha: { name: 'Kin Alpha', slug: 'kin-alpha' },
    ledgerDex: {
      name: 'LedgerDex',
      url: 'https://ledgerdex.com/',
      relayer: 'ledgerDex',
    },
    openRelay: {
      name: 'OpenRelay',
      url: 'https://openrelay.xyz/',
      relayer: 'openRelay',
    },
    paradex: {
      name: 'Paradex',
      url: 'https://paradex.io/',
      relayer: 'paradex',
    },
    radarrelay: {
      name: 'Radar Relay',
      url: 'https://radarrelay.com/',
      relayer: 'radarRelay',
    },
    sharkRelay: {
      name: 'Shark Relay',
      url: 'https://sharkrelay.com/',
      relayer: 'sharkRelay',
    },
    theOcean: {
      name: 'The Ocean',
      url: 'https://theocean.trade/',
      relayer: 'theOcean',
    },
  },
};
