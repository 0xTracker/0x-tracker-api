const _ = require('lodash');
const { FILL_STATUS } = require('../constants');

const reverseMapStatus = statusLabel => {
  if (statusLabel === undefined) {
    return undefined;
  }

  const upperLabel = _.toUpper(statusLabel);
  const status = FILL_STATUS[upperLabel];

  if (status === undefined) {
    throw new Error(`Unrecognised status label: ${statusLabel}`);
  }

  return status;
};

module.exports = reverseMapStatus;
