const _ = require('lodash');

const RELAYERS = {
  bambooRelay: {
    lookupId: 1,
    name: 'Bamboo Relay',
    slug: 'bamboo-relay',
    url: 'https://bamboorelay.com/',
  },
  ddex: {
    lookupId: 2,
    name: 'DDEX',
    slug: 'ddex',
    url: 'https://ddex.io',
  },
  ercDex: {
    lookupId: 3,
    name: 'ERC dEX',
    slug: 'erc-dex',
    url: 'https://ercdex.com',
  },
  idtExchange: {
    lookupId: 4,
    name: 'IDT Exchange',
    slug: 'idt-exchange',
    url: 'https://www.idtexchange.com',
  },
  ledgerDex: {
    lookupId: 12,
    name: 'LedgerDex',
    slug: 'ledger-dex',
    url: 'https://ledgerdex.com',
  },
  openRelay: {
    lookupId: 5,
    name: 'OpenRelay',
    slug: 'open-relay',
    url: 'https://openrelay.xyz',
  },
  paradex: {
    lookupId: 6,
    name: 'Paradex',
    slug: 'paradex',
    url: 'https://paradex.io',
  },
  radarRelay: {
    lookupId: 7,
    name: 'Radar Relay',
    slug: 'radar-relay',
    url: 'https://radarrelay.com',
  },
  sharkRelay: {
    lookupId: 8,
    name: 'Shark Relay',
    slug: 'shark-relay',
    url: 'https://sharkrelay.com',
  },
  starBit: {
    lookupId: 9,
    name: 'STAR BIT',
    slug: 'star-bit',
    url: 'https://www.starbitex.com',
  },
  theOcean: {
    lookupId: 13,
    name: 'The Ocean',
    slug: 'the-ocean',
    url: 'https://theocean.trade/',
  },
  tokenJar: {
    lookupId: 10,
    name: 'Token Jar',
    slug: 'token-jar',
    url: 'https://tokenjar.io/',
  },
  tokenlon: {
    lookupId: 11,
    name: 'Tokenlon',
    slug: 'tokenlon',
    url: 'https://tokenlon.token.im/',
  },
};

const getAll = () => {
  const relayers = _.mapValues(RELAYERS, (relayer, id) => ({
    ...relayer,
    id,
  }));

  return relayers;
};

module.exports = getAll;
