const getCdnTokenImageUrl = imageUrl => {
  if (
    imageUrl.startsWith(
      'https://raw.githubusercontent.com/TrustWallet/tokens/master/tokens/',
    )
  ) {
    const fileName = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
    return `https://cdn.staticaly.com/gh/TrustWallet/tokens/master/tokens/${fileName}`;
  }

  if (
    imageUrl.startsWith(
      'https://raw.githubusercontent.com/TrustWallet/assets/master/blockchains/ethereum/assets/',
    )
  ) {
    const path = imageUrl.substr(
      'https://raw.githubusercontent.com/TrustWallet/assets/master/blockchains/ethereum/assets/'
        .length,
    );
    return `https://cdn.staticaly.com/gh/TrustWallet/assets/master/blockchains/ethereum/assets/${path}`;
  }

  return imageUrl;
};

module.exports = getCdnTokenImageUrl;
