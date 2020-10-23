const _ = require('lodash');

const { FILL_ATTRIBUTION_TYPE } = require('../constants');

const formatFillAttributionType = type => {
  if (type === undefined) {
    return undefined;
  }

  const matchingKey = _.findKey(FILL_ATTRIBUTION_TYPE, value => type === value);

  if (matchingKey === undefined) {
    throw new Error(`Unrecognised fill attribution type: ${type}`);
  }

  return matchingKey.toLowerCase();
};

module.exports = formatFillAttributionType;
