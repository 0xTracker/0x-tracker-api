const createMiddleware = () => async (context, next) => {
  context.set('Access-Control-Allow-Origin', '*');
  context.set('Access-Control-Allow-Methods', '*');
  context.set('Access-Control-Allow-Headers', '*');

  await next();
};

module.exports = createMiddleware;
