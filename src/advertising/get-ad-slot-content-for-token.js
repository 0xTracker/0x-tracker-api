const AdSlotContent = require('../model/ad-slot-content');

const mapSubmissionStatus = status =>
  ({ 0: 'pending', 1: 'accepted', 2: 'rejected' }[status]);

const getAdSlotContentForToken = async (tokenAddress, tokenId) => {
  const content = await AdSlotContent.findOne({ tokenAddress, tokenId });

  if (content === null) {
    return null;
  }

  return {
    description: content.description,
    imageUrl: content.imageUrl,
    submissionStatus: mapSubmissionStatus(content.submissionStatus),
    title: content.title,
    url: content.url,
  };
};

module.exports = getAdSlotContentForToken;
