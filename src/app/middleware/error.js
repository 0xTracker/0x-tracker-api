const createMiddleware = () => async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.response.body = {
      errors: [
        {
          code: 'UNEXPECTED_ERROR',
          status: 500,
          title:
            'An unexpected error occurred whilst trying to process the request.',
        },
      ],
    };
    ctx.response.status = 500;
    ctx.app.emit('error', err, ctx);
  }
};

module.exports = createMiddleware;
