const _ = require('lodash');

const createMiddleware = ({ defaultLimit, maxPage, maxLimit }) => async (
  context,
  next,
) => {
  const { request } = context;

  const page = _.clamp(_.toNumber(_.get(request, 'query.page', 1)), 1, maxPage);
  const limit = _.clamp(
    _.toNumber(_.get(request, 'query.limit', defaultLimit)),
    1,
    maxLimit,
  );

  // eslint-disable-next-line no-param-reassign
  context.pagination = { page, limit };

  await next();
};

module.exports = createMiddleware;
