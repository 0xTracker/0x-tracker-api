const { TOKEN_TYPE } = require('../constants');

const formatTokenType = tokenType => {
  if (tokenType === undefined || tokenType === null) {
    return null;
  }

  switch (tokenType) {
    case TOKEN_TYPE.ERC20:
      return 'erc-20';
    case TOKEN_TYPE.ERC721:
      return 'erc-721';
    case TOKEN_TYPE.ERC1155:
      return 'erc-1155';
    default:
      throw new Error(`Unrecognised token type: ${tokenType}`);
  }
};

module.exports = formatTokenType;
