const { TRADER_TYPE } = require('../constants');
const formatTraderType = require('./format-trader-type');

describe('formatTraderType', () => {
  it('should handle undefined trader type gracefully', () => {
    const formatted = formatTraderType(undefined);

    expect(formatted).toBeUndefined();
  });

  it('should format maker trader type', () => {
    const formatted = formatTraderType(TRADER_TYPE.MAKER);

    expect(formatted).toBe('maker');
  });

  it('should format taker trader type', () => {
    const formatted = formatTraderType(TRADER_TYPE.TAKER);

    expect(formatted).toBe('taker');
  });

  it('should throw an error when formatting unknown trader type', () => {
    expect(() => {
      formatTraderType(999);
    }).toThrow(new Error('Unrecognised trader type: 999'));
  });
});
