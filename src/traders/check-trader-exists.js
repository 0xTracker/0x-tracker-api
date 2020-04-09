const elasticsearch = require('../util/elasticsearch');

const checkTraderExists = async address => {
  const response = await elasticsearch.getClient().count({
    index: 'fills',
    body: { query: { term: { traders: address } } },
  });

  return response.body.count > 0;
};

module.exports = checkTraderExists;
