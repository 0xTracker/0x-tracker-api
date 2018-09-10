const createMiddleware = () => async ctx => {
  if (ctx.response.status === 404) {
    ctx.response.body = {
      errors: [
        {
          code: 'INVALID_URL',
          status: 404,
          title: 'The requested URL is invalid.',
        },
      ],
    };
    ctx.response.status = 404;
  }
};

module.exports = createMiddleware;
