const createMiddleware = () => async (context, next) => {
  context.set('Access-Control-Allow-Origin', '*');
  context.set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,POST,DELETE');

  await next();
};

module.exports = createMiddleware;
