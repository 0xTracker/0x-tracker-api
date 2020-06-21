const transformToken = require('./transform-token');

it('should rewrite image urls to be served from CDN', () => {
  const token = {
    imageUrl:
      'https://raw.githubusercontent.com/TrustWallet/tokens/master/tokens/0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359.png',
  };
  const transformed = transformToken(token);

  expect(transformed.imageUrl).toBe(
    'https://cdn.staticaly.com/gh/TrustWallet/tokens/master/tokens/0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359.png',
  );
});

it('should not transform non trust-wallet image urls', () => {
  const token = {
    imageUrl: 'http://tmpuri.org/test.jpg',
  };
  const transformed = transformToken(token);

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
  const transformed = transformToken(token);

  expect(transformed).toEqual({
    address: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
    circulatingSupply: null,
    imageUrl: 'http://tmpuri.org/test.jpg',
    lastTrade: null,
    marketCap: null,
    name: 'DAI Stablecoin',
    price: {
      change: null,
      close: null,
      high: null,
      last: null,
      low: null,
      open: null,
    },
    symbol: 'DAI',
    totalSupply: null,
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
  const transformed = transformToken(token);

  expect(transformed).toEqual({
    address: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
    circulatingSupply: null,
    imageUrl: null,
    lastTrade: null,
    marketCap: null,
    name: 'DAI Stablecoin',
    price: {
      change: null,
      close: null,
      high: null,
      last: null,
      low: null,
      open: null,
    },
    symbol: 'DAI',
    totalSupply: null,
    type: 'erc-20',
  });
});
