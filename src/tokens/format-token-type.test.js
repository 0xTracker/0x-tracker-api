const { TOKEN_TYPE } = require('../constants');
const formatTokenType = require('./format-token-type');

describe('formatTokenType', () => {
  it('should handle undefined token type gracefully', () => {
    const formatted = formatTokenType(undefined);

    expect(formatted).toBeNull();
  });

  it('should format ERC-20 token type', () => {
    const formatted = formatTokenType(TOKEN_TYPE.ERC20);

    expect(formatted).toBe('erc-20');
  });

  it('should format ERC-721 token type', () => {
    const formatted = formatTokenType(TOKEN_TYPE.ERC721);

    expect(formatted).toBe('erc-721');
  });

  it('should format ERC-1155 token type', () => {
    const formatted = formatTokenType(TOKEN_TYPE.ERC1155);

    expect(formatted).toBe('erc-1155');
  });

  it('should throw an error when formatting unknown token type', () => {
    expect(() => {
      formatTokenType(999);
    }).toThrow(new Error('Unrecognised token type: 999'));
  });
});
