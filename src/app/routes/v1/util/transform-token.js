const _ = require('lodash');

const getCdnTokenImageUrl = require('../../../../tokens/get-cdn-token-image-url');

const transformToken = token => {
  const transformed = _.pick(token, [
    'address',
    'imageUrl',
    'name',
    'symbol',
    'price',
  ]);

  if (transformed.imageUrl) {
    return {
      ...transformed,
      imageUrl: getCdnTokenImageUrl(transformed.imageUrl),
    };
  }

  return transformed;
};

module.exports = transformToken;
