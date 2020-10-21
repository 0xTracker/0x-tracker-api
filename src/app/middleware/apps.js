const _ = require('lodash');

const normalizeArrayParam = param => {
  if (param === undefined || param === null) {
    return [];
  }

  if (param.trim().length === 0) {
    return [];
  }

  return param.split(',');
};

const createMiddleware = (paramName, defaultValue) => async (context, next) => {
  const { request } = context;

  const apps = normalizeArrayParam(request.query[paramName]);

  _.set(
    context,
    ['params', paramName],
    apps.length === 0 ? defaultValue : apps,
  );

  await next();
};

module.exports = createMiddleware;
