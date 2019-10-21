const { TRADER_TYPE } = require('../constants');

const formatTraderType = traderType => {
  if (traderType === undefined) {
    return undefined;
  }

  switch (traderType) {
    case TRADER_TYPE.MAKER:
      return 'maker';
    case TRADER_TYPE.TAKER:
      return 'taker';
    default:
      throw new Error(`Unrecognised trader type: ${traderType}`);
  }
};

module.exports = formatTraderType;
