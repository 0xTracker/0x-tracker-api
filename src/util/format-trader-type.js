const formatTraderType = traderType => {
  if (traderType === undefined) {
    return undefined;
  }

  switch (traderType) {
    case 0:
      return 'maker';
    case 1:
      return 'taker';
    default:
      throw new Error(`Unrecognised trader type: ${traderType}`);
  }
};

module.exports = formatTraderType;
