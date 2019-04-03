const WETH_FIXTURE = {
  address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  name: 'Wrapped Ether',
  symbol: 'WETH',
  decimals: 18,
  id: '5a3c789201d64f914cbc509b',
  imageUrl:
    'https://raw.githubusercontent.com/TrustWallet/tokens/master/tokens/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
  price: {
    lastTrade: {
      date: '2019-04-03T08:23:47.000Z',
      id: '5ca46e365ba86000042b2f21',
    },
    lastPrice: 166.20068815561643,
  },
  stats: {
    '24h': {
      trades: 796,
      volume: { token: 2.3275831893455921e21, USD: 379770.008861849 },
    },
    '7d': {
      trades: 3945,
      volume: { token: 7.06794860909241e21, USD: 1060852.3398060245 },
    },
    '1m': {
      trades: 11976,
      volume: { token: 2.87225873367478e22, USD: 4016464.540882649 },
    },
  },
};

module.exports = WETH_FIXTURE;
