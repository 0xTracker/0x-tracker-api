const Token = require('../model/token');

const searchTokens = async (query, options) => {
  const tokens = await Token.find(
    query.length > 0
      ? {
          $or: [
            { address: query },
            { name: new RegExp(query, 'ig') },
            { symbol: new RegExp(query, 'ig') },
          ],
        }
      : {},
  )
    .sort({ name: 1 })
    .limit(options.limit)
    .lean();

  return tokens;
};

module.exports = searchTokens;
