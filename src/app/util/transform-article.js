const _ = require('lodash');

const getAllRelayers = require('../../relayers/get-all-relayers');

const sources = {
  '0xproject': {
    name: '0x Project',
    url: 'https://0xproject.com',
    imageUrl: 'https://0xtracker.com/assets/logos/0x.png',
  },
  amadeus: {
    name: 'Amadeus Relay',
    url: 'https://amadeusrelay.org/',
    imageUrl: 'https://0xtracker.com/assets/logos/amadeus-relay.png',
  },
  ddex: { name: 'DDEX', url: 'https://ddex.io/', relayer: 'ddex' },
  dharma: {
    name: 'Dharma',
    url: 'https://dharma.io/',
    imageUrl: 'https://0xtracker.com/assets/logos/dharma.png',
  },
  dYdX: {
    name: 'dYdX',
    url: 'https://dydx.exchange/',
    imageUrl: 'https://0xtracker.com/assets/logos/dydx.png',
  },
  ercdex: { name: 'ERC dEX', url: 'https://ercdex.com/', relayer: 'ercDex' },
  ethfinex: {
    name: 'Ethfinex',
    url: 'https://www.ethfinex.com/',
    imageUrl: 'https://0xtracker.com/assets/logos/ethfinex.png',
  },
  kinalpha: { name: 'Kin Alpha' },
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
  paradex: { name: 'Paradex', url: 'https://paradex.io/', relayer: 'paradex' },
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
};

const transformArticle = article => {
  const relayers = getAllRelayers();
  const source = sources[article.feed];
  const relayer = source.relayer ? relayers[source.relayer] : undefined;

  return {
    ..._.pick(article, ['date', 'id', 'summary', 'title', 'url']),
    source: relayer
      ? {
          ..._.pick(relayer, 'id', 'name', 'imageUrl', 'url'),
          type: 'relayer',
        }
      : { ...source, type: 'other' },
  };
};

module.exports = transformArticle;
