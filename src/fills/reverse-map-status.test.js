const reverseMapStatus = require('./reverse-map-status');

describe('reverseMapStatus', () => {
  it('should return undefined when label is undefined', () => {
    const status = reverseMapStatus(undefined);

    expect(status).toBeUndefined();
  });

  it('should throw an error when label is unrecognised', () => {
    expect(() => {
      reverseMapStatus('fubar');
    }).toThrow(new Error('Unrecognised status label: fubar'));
  });

  it('should map "failed" to 2', () => {
    const status = reverseMapStatus('failed');

    expect(status).toBe(2);
  });

  it('should map "pending" to 0', () => {
    const status = reverseMapStatus('pending');

    expect(status).toBe(0);
  });

  it('should map "successful" to 1', () => {
    const status = reverseMapStatus('successful');

    expect(status).toBe(1);
  });
});
