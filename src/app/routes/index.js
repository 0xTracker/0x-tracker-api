const Router = require('koa-router');

const createV1Router = require('./v1');

const router = new Router();

router.use(createV1Router().routes());
router.use('/v1', createV1Router().routes());

router.get('/', ({ response }) => {
  response.body = 'OK';
});

module.exports = router;
