const VALID_MINTERS = ['0x56d9fb185343ff68484abb2964ad319728083cc9'];
const VALID_CONTENT_IDS = ['dns%3A0xtracker.com'];

const isSlotToken = tokenMetadata =>
  VALID_MINTERS.includes(tokenMetadata.minter.toLowerCase()) &&
  VALID_CONTENT_IDS.includes(tokenMetadata.contentId);

module.exports = isSlotToken;
