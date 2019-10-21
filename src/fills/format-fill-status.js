const _ = require('lodash');

const { FILL_STATUS } = require('../constants');

const formatFillStatus = status => {
  if (status === undefined) {
    return undefined;
  }

  const matchingKey = _.findKey(FILL_STATUS, value => status === value);

  if (matchingKey === undefined) {
    throw new Error(`Unrecognised fill status: ${status}`);
  }

  return matchingKey.toLowerCase();
};

module.exports = formatFillStatus;
