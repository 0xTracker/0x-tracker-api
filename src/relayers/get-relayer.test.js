const getRelayer = require('./get-relayer');

it('should get radar relay', () => {
  const radarRelay = getRelayer('radarRelay');

  expect(radarRelay).toEqual({
    id: 'radarRelay',
    imageUrl: 'https://0xtracker.com/assets/logos/radar-relay.png',
    lookupId: 7,
    name: 'Radar Relay',
    slug: 'radar-relay',
    url: 'https://radarrelay.com',
  });
});

it('should get paradex', () => {
  const paradex = getRelayer('paradex');

  expect(paradex).toEqual({
    id: 'paradex',
    imageUrl: 'https://0xtracker.com/assets/logos/paradex.png',
    lookupId: 6,
    name: 'Paradex',
    slug: 'paradex',
    url: 'https://paradex.io',
  });
});

it('should get erc dex', () => {
  const paradex = getRelayer('ercDex');

  expect(paradex).toEqual({
    id: 'ercDex',
    imageUrl: 'https://0xtracker.com/assets/logos/erc-dex.png',
    lookupId: 3,
    name: 'ERC dEX',
    slug: 'erc-dex',
    url: 'https://ercdex.com',
  });
});
