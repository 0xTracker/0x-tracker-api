const transformToken = require('./transform-token');

const simpleToken = {
  _id: '5210',
  address: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
  decimals: 18,
  name: 'DAI Stablecoin',
  symbol: 'DAI',
};

it('should only return white-listed fields', () => {
  const token = {
    ...simpleToken,
    imageUrl: 'http://tmpuri.org/test.jpg',
    price: {
      lastPrice: 1.01,
      lastTrade: {
        id: '5c5d4486c0354aae90dff084',
        date: new Date('2018-10-01T15:04:19.000Z'),
      },
    },
    stats: {
      '24h': {
        fillCount: 10,
        volume: {
          token: 1500000000000000000,
          USD: 1.51,
        },
      },
    },
  };
  const transformed = transformToken(token);

  expect(transformed).toEqual({
    address: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
    imageUrl: 'http://tmpuri.org/test.jpg',
    lastTrade: {
      date: new Date('2018-10-01T15:04:19.000Z'),
      id: '5c5d4486c0354aae90dff084',
    },
    name: 'DAI Stablecoin',
    price: {
      last: 1.01,
    },
    stats: {
      '24h': {
        fillCount: 10,
        volume: {
          token: '1.5',
          USD: 1.51,
        },
      },
    },
    symbol: 'DAI',
  });
});

it('should transform tokens which dont have an image url', () => {
  const transformed = transformToken(simpleToken);

  expect(transformed.imageUrl).toBeUndefined();
});

it('should not return price object if unavailable', () => {
  const token = {
    ...simpleToken,
    price: {
      lastTrade: {
        id: '5c5d4486c0354aae90dff084',
        date: new Date('2018-10-01T15:04:19.000Z'),
      },
    },
  };
  const transformed = transformToken(token);

  expect(transformed.price).toBeUndefined();
});

it('should not return stats object if unavailable', () => {
  const transformed = transformToken(simpleToken);

  expect(transformed.stats).toBeUndefined();
});

it('should not return stats object if deeply empty', () => {
  const token = {
    ...simpleToken,
    stats: {
      '24h': {},
    },
  };
  const transformed = transformToken(token);

  expect(transformed.stats).toBeUndefined();
});
