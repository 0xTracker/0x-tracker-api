const _ = require('lodash');

const getRelayerLookupId = require('../../relayers/get-relayer-lookup-id');
const InvalidParameterError = require('../errors/invalid-parameter-error');

const normalizeStringParam = param => {
  if (param === undefined || param === null) {
    return undefined;
  }

  if (param.trim().length === 0) {
    return undefined;
  }

  return param;
};

const createMiddleware = paramName => async (context, next) => {
  const { request } = context;

  const relayerId = normalizeStringParam(request.query[paramName]);
  const relayerLookupId = await getRelayerLookupId(relayerId);

  if (relayerId !== undefined) {
    if (relayerLookupId === undefined) {
      throw new InvalidParameterError(
        'Must be a valid relayer',
        `Invalid ${paramName} parameter: ${relayerId}`,
      );
    }

    _.set(context, ['params', paramName], relayerLookupId);
    await next();
    return;
  }

  await next();
};

module.exports = createMiddleware;
