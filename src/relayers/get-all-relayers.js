const _ = require('lodash');

const RELAYERS = {
  bambooRelay: {
    imageUrl: 'https://0xtracker.com/assets/logos/bamboo-relay.png',
    lookupId: 1,
    name: 'Bamboo Relay',
    slug: 'bamboo-relay',
    url: 'https://bamboorelay.com/',
  },
  ddex: {
    imageUrl: 'https://0xtracker.com/assets/logos/ddex.png',
    lookupId: 2,
    name: 'DDEX',
    slug: 'ddex',
    url: 'https://ddex.io',
  },
  ercDex: {
    imageUrl: 'https://0xtracker.com/assets/logos/erc-dex.png',
    lookupId: 3,
    name: 'ERC dEX',
    slug: 'erc-dex',
    url: 'https://ercdex.com',
  },
  idtExchange: {
    lookupId: 4,
    name: 'IDT Exchange',
    slug: 'idt-exchange',
  },
  ledgerDex: {
    imageUrl: 'https://0xtracker.com/assets/logos/ledger-dex.png',
    lookupId: 12,
    name: 'LedgerDex',
    slug: 'ledger-dex',
    url: 'https://ledgerdex.com',
  },
  openRelay: {
    imageUrl: 'https://0xtracker.com/assets/logos/open-relay.png',
    lookupId: 5,
    name: 'OpenRelay',
    slug: 'open-relay',
    url: 'https://openrelay.xyz',
  },
  paradex: {
    imageUrl: 'https://0xtracker.com/assets/logos/paradex.png',
    lookupId: 6,
    name: 'Paradex',
    slug: 'paradex',
    url: 'https://paradex.io',
  },
  radarRelay: {
    imageUrl: 'https://0xtracker.com/assets/logos/radar-relay.png',
    lookupId: 7,
    name: 'Radar Relay',
    slug: 'radar-relay',
    url: 'https://radarrelay.com',
  },
  sharkRelay: {
    imageUrl: 'https://0xtracker.com/assets/logos/shark-relay.png',
    lookupId: 8,
    name: 'Shark Relay',
    slug: 'shark-relay',
    url: 'https://sharkrelay.com',
  },
  starBit: {
    imageUrl: 'https://0xtracker.com/assets/logos/starbit.png',
    lookupId: 9,
    name: 'STAR BIT',
    slug: 'star-bit',
    url: 'https://www.starbitex.com',
  },
  theOcean: {
    imageUrl: 'https://0xtracker.com/assets/logos/the-ocean.png',
    lookupId: 13,
    name: 'The Ocean',
    slug: 'the-ocean',
    url: 'https://theocean.trade/',
  },
  tokenJar: {
    imageUrl: 'https://0xtracker.com/assets/logos/token-jar.png',
    lookupId: 10,
    name: 'Token Jar',
    slug: 'token-jar',
    url: 'https://tokenjar.io/',
  },
  tokenlon: {
    imageUrl: 'https://0xtracker.com/assets/logos/tokenlon.png',
    lookupId: 11,
    name: 'Tokenlon',
    slug: 'tokenlon',
    url: 'https://tokenlon.token.im/tokenlon',
  },
  tokenmom: {
    imageUrl: 'https://0xtracker.com/assets/logos/tokenmom.png',
    lookupId: 15,
    name: 'Tokenmom',
    slug: 'tokenmom',
    url: 'https://tokenmom.com',
  },
  boxSwap: {
    imageUrl: 'https://0xtracker.com/assets/logos/box-swap.png',
    lookupId: 14,
    name: 'Boxswap',
    slug: 'boxswap',
    url: 'https://boxswap.io/',
  },
  guDecks: {
    imageUrl: 'https://0xtracker.com/assets/logos/gudecks.png',
    lookupId: 16,
    name: 'GUDecks',
    slug: 'gu-decks',
    url: 'https://gudecks.com/',
  },
  instex: {
    imageUrl: 'https://0xtracker.com/assets/logos/instex.png',
    lookupId: 17,
    name: 'Instex',
    slug: 'instex',
    url: 'https://instex.io',
  },
  veil: {
    imageUrl: 'https://0xtracker.com/assets/logos/veil.png',
    lookupId: 18,
    name: 'Veil',
    slug: 'veil',
    url: 'https://veil.co/',
  },
  emoon: {
    imageUrl: 'https://0xtracker.com/assets/logos/emoon.png',
    lookupId: 19,
    name: 'Emoon',
    slug: 'emoon',
    url: 'https://emoon.io',
  },
  fordex: {
    imageUrl: 'https://0xtracker.com/assets/logos/fordex.png',
    lookupId: 20,
    name: 'Fordex',
    slug: 'fordex',
    url: 'https://www.fordex.co',
  },
};

const getAllRelayers = () => {
  const relayers = _.mapValues(RELAYERS, (relayer, id) => ({
    ...relayer,
    id,
  }));

  return relayers;
};

module.exports = getAllRelayers;
