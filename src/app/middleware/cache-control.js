const createMiddleware = ({ maxAge } = { maxAge: 30 }) => async (
  context,
  next,
) => {
  // Cache all requests for 30 seconds
  context.set('Cache-Control', `max-age=${maxAge}`);

  await next();
};

module.exports = createMiddleware;
