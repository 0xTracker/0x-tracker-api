const _ = require('lodash');

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
  const tokenAddress = normalizeStringParam(request.query[paramName]);

  _.set(context, ['params', paramName], tokenAddress || defaultValue);

  await next();
};

module.exports = createMiddleware;
