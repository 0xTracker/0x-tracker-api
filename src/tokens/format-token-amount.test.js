const { BigNumber } = require('@0xproject/utils');

const formatTokenAmount = require('./format-token-amount');

it('should return undefined when token is unknown', () => {
  const amount = formatTokenAmount(10500, undefined);

  expect(amount).toBe(undefined);
});

it('should return undefined when token does not have decimals', () => {
  const amount = formatTokenAmount(12, { name: 'Random' });

  expect(amount).toBe(undefined);
});

it('should return formatted amount', () => {
  const amount = formatTokenAmount(22000000000000000000, { decimals: 18 });

  expect(amount).toEqual(new BigNumber(22));
});

it('should format tiny amount', () => {
  const amount = formatTokenAmount(1, { decimals: 18 });

  expect(amount).toEqual(new BigNumber(0.000000000000000001));
});

it('should format large amount', () => {
  const amount = formatTokenAmount(100000000000000000000000000, {
    decimals: 18,
  });

  expect(amount).toEqual(new BigNumber(100000000));
});

it('should return null when amount is null', () => {
  const amount = formatTokenAmount(null, {
    decimals: 18,
  });

  expect(amount).toBeNull();
});

it('should return undefined when amount is undefined', () => {
  const amount = formatTokenAmount(undefined, {
    decimals: 18,
  });

  expect(amount).toBeUndefined();
});
