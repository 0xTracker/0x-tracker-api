const _ = require('lodash');

const transformImageUrl = imageUrl => {
  if (
    imageUrl.startsWith(
      'https://raw.githubusercontent.com/TrustWallet/tokens/master/images/',
    )
  ) {
    const fileName = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
    return `https://cdn.staticaly.com/gh/TrustWallet/tokens/master/images/${fileName}`;
  }

  return imageUrl;
};

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
      imageUrl: transformImageUrl(transformed.imageUrl),
    };
  }

  return transformed;
};

module.exports = transformToken;
