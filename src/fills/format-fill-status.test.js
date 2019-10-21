const { FILL_STATUS } = require('../constants');
const formatFillStatus = require('./format-fill-status');

describe('formatFillStatus', () => {
  it('should handle undefined fill status gracefully', () => {
    const formatted = formatFillStatus(undefined);

    expect(formatted).toBeUndefined();
  });

  it('should format FAILED fill status', () => {
    const formatted = formatFillStatus(FILL_STATUS.FAILED);

    expect(formatted).toBe('failed');
  });

  it('should format PENDING fill status', () => {
    const formatted = formatFillStatus(FILL_STATUS.PENDING);

    expect(formatted).toBe('pending');
  });

  it('should format SUCCESSFUL fill status', () => {
    const formatted = formatFillStatus(FILL_STATUS.SUCCESSFUL);

    expect(formatted).toBe('successful');
  });

  it('should throw an error when formatting unknown fill status', () => {
    expect(() => {
      formatFillStatus(999);
    }).toThrow(new Error('Unrecognised fill status: 999'));
  });
});
