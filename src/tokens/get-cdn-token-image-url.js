const getCdnTokenImageUrl = imageUrl => {
  if (
    imageUrl.startsWith(
      'https://raw.githubusercontent.com/TrustWallet/tokens/master/tokens/',
    )
  ) {
    const fileName = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
    return `https://cdn.staticaly.com/gh/TrustWallet/tokens/master/tokens/${fileName}`;
  }

  return imageUrl;
};

module.exports = getCdnTokenImageUrl;
