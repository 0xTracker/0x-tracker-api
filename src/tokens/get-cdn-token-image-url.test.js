const getCdnTokenImageUrl = require('./get-cdn-token-image-url');

it('should rewrite image urls for tokens repository', () => {
  const cdnUrl = getCdnTokenImageUrl(
    'https://raw.githubusercontent.com/TrustWallet/tokens/master/tokens/0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359.png',
  );

  expect(cdnUrl).toBe(
    'https://cdn.staticaly.com/gh/TrustWallet/tokens/master/tokens/0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359.png',
  );
});

it('should rewrite image urls for assets repository', () => {
  const cdnUrl = getCdnTokenImageUrl(
    'https://raw.githubusercontent.com/TrustWallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
  );

  expect(cdnUrl).toBe(
    'https://cdn.staticaly.com/gh/TrustWallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
  );
});

it('should not transform non trust-wallet image urls', () => {
  const cdnUrl = getCdnTokenImageUrl('http://tmpuri.org/test.jpg');

  expect(cdnUrl).toBe('http://tmpuri.org/test.jpg');
});
