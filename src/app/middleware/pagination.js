const _ = require('lodash');
const InvalidParameterError = require('../errors/invalid-parameter-error');

const validateNumber = (param, number, max) => {
  if (!_.isFinite(number)) {
    throw new InvalidParameterError(
      'Must be a valid number',
      `Invalid query parameter: ${param}`,
    );
  }

  if (number < 1) {
    throw new InvalidParameterError(
      'Must be greater than zero',
      `Invalid query parameter: ${param}`,
    );
  }

  if (number > max) {
    throw new InvalidParameterError(
      `Must be ${max} or less`,
      `Invalid query parameter: ${param}`,
    );
  }
};

const createMiddleware = ({ defaultLimit, maxPage, maxLimit }) => async (
  context,
  next,
) => {
  const { request } = context;

  const queryPage = _.toNumber(_.get(request, 'query.page', 1));
  const queryLimit = _.toNumber(_.get(request, 'query.limit', defaultLimit));

  validateNumber('page', queryPage, maxPage);
  validateNumber('limit', queryLimit, maxLimit);

  const page = _.clamp(queryPage, 1, maxPage);
  const limit = _.clamp(queryLimit, 1, maxLimit);

  // eslint-disable-next-line no-param-reassign
  context.pagination = { page, limit };

  await next();
};

module.exports = createMiddleware;
