const createMiddleware = () => async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    const status = error.status === undefined ? 500 : error.status;

    ctx.response.body = {
      errors: [
        {
          code: error.code === undefined ? 'UNEXPECTED_ERROR' : error.code,
          message: error.handled
            ? error.message
            : 'An unexpected error occurred whilst trying to process the request.',
          reason: error.reason,
          status,
        },
      ],
    };

    ctx.response.status = status;

    if (error.handled === undefined || error.handled === false) {
      ctx.app.emit('error', error, ctx);
    }
  }
};

module.exports = createMiddleware;
