const Token = require('../model/token');

const searchTokens = async (query, page, limit) => {
  const tokens = await Token.paginate(query, {
    sort: { date: -1 },
    limit,
    page,
  });

  return tokens;
};

module.exports = searchTokens;
