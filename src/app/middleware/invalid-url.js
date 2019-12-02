const createMiddleware = () => async ctx => {
  if (ctx.response.status === 404) {
    ctx.response.body = {
      errors: [
        {
          code: 'INVALID_URL',
          message: 'The requested URL is invalid.',
          status: 404,
        },
      ],
    };
    ctx.response.status = 404;
  }
};

module.exports = createMiddleware;
