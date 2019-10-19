const { TOKEN_TYPE } = require('../constants');

const formatTokenType = tokenType => {
  if (tokenType === undefined) {
    return undefined;
  }

  switch (tokenType) {
    case TOKEN_TYPE.ERC20:
      return 'erc-20';
    case TOKEN_TYPE.ERC721:
      return 'erc-721';
    default:
      throw new Error(`Unrecognised token type: ${tokenType}`);
  }
};

module.exports = formatTokenType;
