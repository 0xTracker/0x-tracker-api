const getCdnTokenImageUrl = require('./get-cdn-token-image-url');

it('should rewrite image urls to be served from CDN', () => {
  const cdnUrl = getCdnTokenImageUrl(
    'https://raw.githubusercontent.com/TrustWallet/tokens/master/tokens/0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359.png',
  );

  expect(cdnUrl).toBe(
    'https://cdn.staticaly.com/gh/TrustWallet/tokens/master/tokens/0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359.png',
  );
});

it('should not transform non trust-wallet image urls', () => {
  const cdnUrl = getCdnTokenImageUrl('http://tmpuri.org/test.jpg');

  expect(cdnUrl).toBe('http://tmpuri.org/test.jpg');
});
