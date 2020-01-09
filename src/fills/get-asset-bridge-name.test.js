const getAssetBridgeName = require('./get-asset-bridge-name');

it('should return undefined when address is undefined', () => {
  const name = getAssetBridgeName();

  expect(name).toBeUndefined();
});

it('should return Eth2Dai when address is 0xe97ea901d034ba2e018155264f77c417ce7717f9', () => {
  const name = getAssetBridgeName('0xe97ea901d034ba2e018155264f77c417ce7717f9');

  expect(name).toBe('Eth2Dai');
});

it('should return Kyber when address is 0xf342f3a80fdc9b48713d58fe97e17f5cc764ee62', () => {
  const name = getAssetBridgeName('0xf342f3a80fdc9b48713d58fe97e17f5cc764ee62');

  expect(name).toBe('Kyber');
});

it('should return Kyber when address is 0x7253a80c1d3a3175283bad9ed04b2cecad0fe0d3', () => {
  const name = getAssetBridgeName('0x7253a80c1d3a3175283bad9ed04b2cecad0fe0d3');

  expect(name).toBe('Kyber');
});
