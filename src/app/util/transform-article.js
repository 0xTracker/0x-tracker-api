const _ = require('lodash');

const sources = {
  '0xproject': { name: '0x Project', url: 'https://0xproject.com' },
  amadeus: { name: 'Amadeus Relay', url: 'https://amadeusrelay.org/' },
  ddex: { name: 'DDEX', url: 'https://ddex.io/' },
  dharma: { name: 'Dharma', url: 'https://dharma.io/' },
  dYdX: { name: 'dYdX', url: 'https://dydx.exchange/' },
  ercdex: { name: 'ERC dEX', url: 'https://ercdex.com/' },
  ethfinex: { name: 'Ethfinex', url: 'https://www.ethfinex.com/' },
  kinalpha: { name: 'Kin Alpha' },
  ledgerDex: { name: 'LedgerDex', url: 'https://ledgerdex.com/' },
  openRelay: { name: 'OpenRelay', url: 'https://openrelay.xyz/' },
  paradex: { name: 'Paradex', url: 'https://paradex.io/' },
  radarrelay: { name: 'Radar Relay', url: 'https://radarrelay.com/' },
  sharkRelay: { name: 'Shark Relay', url: 'https://sharkrelay.com/' },
  theOcean: { name: 'The Ocean', url: 'https://theocean.trade/' },
};

const transformArticle = article => ({
  ..._.pick(article, ['date', 'id', 'summary', 'title', 'url']),
  source: sources[article.feed],
});

module.exports = transformArticle;
