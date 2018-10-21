const transformToken = require('./transform-token');

it('should rewrite image urls to be served from CDN', () => {
  const token = {
    imageUrl:
      'https://raw.githubusercontent.com/TrustWallet/tokens/master/images/0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359.png',
  };
  const transformed = transformToken(token);

  expect(transformed.imageUrl).toBe(
    'https://cdn.staticaly.com/gh/TrustWallet/tokens/master/images/0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359.png',
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
  };
  const transformed = transformToken(token);

  expect(transformed).toEqual({
    address: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
    imageUrl: 'http://tmpuri.org/test.jpg',
    name: 'DAI Stablecoin',
    symbol: 'DAI',
  });
});

it('should transform tokens which dont have an image url', () => {
  const token = {
    address: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
    name: 'DAI Stablecoin',
    symbol: 'DAI',
  };
  const transformed = transformToken(token);

  expect(transformed).toEqual({
    address: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
    name: 'DAI Stablecoin',
    symbol: 'DAI',
  });
});
