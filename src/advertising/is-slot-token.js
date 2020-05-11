const VALID_MINTERS = ['0xed129f9eeb2e18f9dcf8fdf61a2373d8ec0aaa49'];
const VALID_CONTENT_IDS = ['dnsemail%3Acraig%40bovis.me.uk'];

const isSlotToken = tokenMetadata =>
  VALID_MINTERS.includes(tokenMetadata.minter.toLowerCase()) &&
  VALID_CONTENT_IDS.includes(tokenMetadata.contentId);

module.exports = isSlotToken;
