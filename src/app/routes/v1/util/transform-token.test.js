const { TIME_PERIOD } = require('../../../../constants');
const transformToken = require('./transform-token');

const stats = {
  price: {
    change: 2.4,
    open: 21.3,
    high: 23.4,
    low: 21.3,
    close: 22.5,
  },
  tradeCount: 10000,
  tradeCountChange: -2.5,
  tradeVolume: 120000,
  tradeVolumeChange: 10.7,
};

const statsPeriod = TIME_PERIOD.DAY;

it('should rewrite image urls to be served from CDN', () => {
  const token = {
    imageUrl:
      'https://raw.githubusercontent.com/TrustWallet/tokens/master/tokens/0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359.png',
  };
  const transformed = transformToken(token, stats, statsPeriod);

  expect(transformed.imageUrl).toBe(
    'https://cdn.staticaly.com/gh/TrustWallet/tokens/master/tokens/0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359.png',
  );
});

it('should not transform non trust-wallet image urls', () => {
  const token = {
    imageUrl: 'http://tmpuri.org/test.jpg',
  };
  const transformed = transformToken(token, stats, statsPeriod);

  expect(transformed.imageUrl).toBe('http://tmpuri.org/test.jpg');
});

it('should only return white-listed fields', () => {
  const token = {
    _id: '5210',
    address: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
    imageUrl: 'http://tmpuri.org/test.jpg',
    name: 'DAI Stablecoin',
    symbol: 'DAI',
    type: 0,
  };
  const transformed = transformToken(token, stats, statsPeriod);

  expect(transformed).toEqual({
    address: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
    imageUrl: 'http://tmpuri.org/test.jpg',
    name: 'DAI Stablecoin',
    price: {
      change: 2.4,
      open: 21.3,
      high: 23.4,
      low: 21.3,
      close: 22.5,
    },
    stats: {
      tradeCount: 10000,
      tradeCountChange: -2.5,
      tradeVolume: 120000,
      tradeVolumeChange: 10.7,
    },
    statsPeriod: 'day',
    symbol: 'DAI',
    type: 'erc-20',
  });
});

it('should transform tokens which dont have an image url', () => {
  const token = {
    address: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
    name: 'DAI Stablecoin',
    symbol: 'DAI',
    type: 0,
  };
  const transformed = transformToken(token, stats, statsPeriod);

  expect(transformed).toEqual({
    address: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
    imageUrl: null,
    name: 'DAI Stablecoin',
    price: {
      change: 2.4,
      open: 21.3,
      high: 23.4,
      low: 21.3,
      close: 22.5,
    },
    stats: {
      tradeCount: 10000,
      tradeCountChange: -2.5,
      tradeVolume: 120000,
      tradeVolumeChange: 10.7,
    },
    statsPeriod: 'day',
    symbol: 'DAI',
    type: 'erc-20',
  });
});
