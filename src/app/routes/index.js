const combineRouters = require('koa-combine-routers');

const articles = require('./articles');
// const metrics = require('./metrics');
// const relayers = require('./relayers');
// const stats = require('./stats');
// const tokens = require('./tokens');
// const trades = require('./trades');
const zrxPrice = require('./zrx-price');

const router = combineRouters(
  articles,
  // metrics,
  // relayers,
  // stats,
  // trades,
  // tokens,
  zrxPrice,
);

module.exports = router;
