const _ = require('lodash');

const InvalidParameterError = require('../errors/invalid-parameter-error');
const reverseMapStatus = require('../../fills/reverse-map-status');

const normalizeStringParam = param => {
  if (param === undefined || param === null) {
    return undefined;
  }

  if (param.trim().length === 0) {
    return undefined;
  }

  return param;
};

const createMiddleware = (paramName, defaultValue) => async (context, next) => {
  const { request } = context;

  const status = normalizeStringParam(request.query[paramName]);

  if (status !== undefined) {
    if (!['failed', 'pending', 'successful'].includes(status)) {
      throw new InvalidParameterError(
        'Must be one of: failed, pending, successful',
        `Invalid query parameter: ${paramName}`,
      );
    }

    _.set(context, ['params', paramName], reverseMapStatus(status));

    await next();
    return;
  }

  _.set(context, ['params', paramName], defaultValue);

  await next();
};

module.exports = createMiddleware;
