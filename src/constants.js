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
    '0xtracker': {
      name: '0x Tracker',
      url: 'https://0xtracker.com',
      imageUrl: 'https://0xtracker.com/assets/logos/0x-tracker.png',
      slug: '0x-tracker',
    },
    amadeus: {
      name: 'Amadeus Relay',
      url: 'https://amadeusrelay.org/',
      imageUrl: 'https://0xtracker.com/assets/logos/amadeus-relay.png',
      slug: 'amadeus-relay',
    },
    boxSwap: {
      relayer: 'boxSwap',
    },
    ddex: { relayer: 'ddex' },
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
    ercdex: { relayer: 'ercDex' },
    ethfinex: {
      name: 'Ethfinex',
      url: 'https://www.ethfinex.com/',
      imageUrl: 'https://0xtracker.com/assets/logos/ethfinex.png',
      slug: 'ethfinex',
    },
    kinalpha: { name: 'Kin Alpha', slug: 'kin-alpha' },
    ledgerDex: {
      relayer: 'ledgerDex',
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
    sharkRelay: {
      relayer: 'sharkRelay',
    },
    theOcean: {
      relayer: 'theOcean',
    },
    tokenmom: {
      relayer: 'tokenmom',
    },
    veil: {
      name: 'Veil',
      url: 'https://veil.co',
      imageUrl: 'https://0xtracker.com/assets/logos/veil.png',
      slug: 'veil',
    },
  },
};
