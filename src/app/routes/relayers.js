const _ = require('lodash');
const Router = require('koa-router');

const getAllRelayers = require('../../relayers/get-all-relayers');

const router = new Router({ prefix: '/relayers' });

router.get('/', async ({ response }, next) => {
  console.log(getAllRelayers());
  const relayers = _.map(getAllRelayers(), relayer =>
    _.pick(relayer, ['id', 'name', 'slug', 'url']),
  );

  response.body = relayers;
  await next();
});

module.exports = router;
