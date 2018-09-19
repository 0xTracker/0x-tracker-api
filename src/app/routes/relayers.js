const _ = require('lodash');
const Router = require('koa-router');

const getAllRelayers = require('../../relayers/get-all-relayers');

const router = new Router({ prefix: '/relayers' });

router.get('/', async ({ response }, next) => {
  const relayers = _.mapValues(getAllRelayers(), relayer =>
    _.pick(relayer, ['name', 'slug', 'url']),
  );

  response.body = relayers;
  await next();
});

module.exports = router;
