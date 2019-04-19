const createMiddleware = ({ maxAge } = { maxAge: 60 }) => async (
  context,
  next,
) => {
  context.set('Cache-Control', `max-age=${maxAge}`);

  await next();
};

module.exports = createMiddleware;
