const ethers = require('ethers');

const CONTRACT_ADDRESS = '0x48acc9ccee8b3581325fdf5171a997b02e95f781';
const CONTRACT_ABI = [
  'function tokenTimeSlot(uint256 tokenId) public view returns (address minter,address owner,string contentId,string propertyName,uint48 startTime,uint48 endTime,uint48 auctionEndTime,uint16 category,bool isSecondaryTradingEnabled,uint32 federationId)',
];

const getTokenMetadata = async (tokenAddress, tokenId) => {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.WEB3_ENDPOINT,
  );

  const contract = new ethers.Contract(tokenAddress, CONTRACT_ABI, provider);

  const [
    minter,
    owner,
    contentId,
    propertyName,
    startTime,
    endTime,
    auctionEndTime,
    category,
    isSecondaryTradingEnabled,
    federationId,
  ] = await contract.tokenTimeSlot(tokenId);

  return {
    auctionEndTime: new Date(auctionEndTime),
    category,
    contentId,
    federationId,
    isSecondaryTradingEnabled,
    minter,
    owner,
    propertyName,
    slotEndTime: new Date(endTime),
    slotStartTime: new Date(startTime),
    tokenAddress: CONTRACT_ADDRESS,
    tokenId,
  };
};

module.exports = { getTokenMetadata };
