const _ = require('lodash');
const { KNOWN_ASSET_BRIDGES } = require('./constants');

it('KNOWN_ASSET_BRIDGES should not contain any duplicate addresses', () => {
  const addresses = _.flatMap(KNOWN_ASSET_BRIDGES, 'addresses');
  const uniqueAddresses = _.uniq(addresses);

  expect(addresses).toEqual(uniqueAddresses);
});
