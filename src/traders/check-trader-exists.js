const elasticsearch = require('../util/elasticsearch');

const checkTraderExists = async address => {
  const response = await elasticsearch.getClient().count({
    index: 'trader_fills',
    body: { query: { term: { address } } },
  });

  return response.body.count > 0;
};

module.exports = checkTraderExists;
