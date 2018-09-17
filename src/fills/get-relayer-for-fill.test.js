const getRelayerForFill = require('./get-relayer-for-fill');

it('should return null when relayer not set', () => {
  const fill = {};
  const relayer = getRelayerForFill(fill);

  expect(relayer).toBeNull();
});

it('should return ercDEX when relayerId matches', () => {
  const fill = { relayerId: 3 };
  const relayer = getRelayerForFill(fill);

  expect(relayer).toEqual({
    id: 'ercDex',
    lookupId: 3,
    name: 'ERC dEX',
    slug: 'erc-dex',
    url: 'https://ercdex.com',
  });
});
