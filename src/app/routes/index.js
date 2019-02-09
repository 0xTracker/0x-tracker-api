const Router = require('koa-router');

const createV1Router = require('./v1');
const createV2Router = require('./v2');

const router = new Router();

router.use(createV1Router().routes());
router.use('/v1', createV1Router().routes());
router.use('/v2', createV2Router().routes());

module.exports = router.routes();
