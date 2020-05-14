const AdSlotContent = require('../model/ad-slot-content');
const { AD_SLOT_SUBMISSION_STATUS, AD_SLOT_TYPE } = require('./constants');

const mapSubmissionStatus = status =>
  ({ 0: 'pending', 1: 'approved', 2: 'rejected' }[status]);

const saveAdSlotContentSubmission = async (tokenMetadata, submission) => {
  const content = await AdSlotContent.create({
    dateFrom: tokenMetadata.slotStartTime,
    dateTo: tokenMetadata.slotEndTime,
    description: submission.description,
    imageUrl: submission.imageUrl,
    submissionEmail: submission.notificationEmail,
    submissionStatus: AD_SLOT_SUBMISSION_STATUS.PENDING,
    title: submission.title,
    tokenAddress: tokenMetadata.tokenAddress,
    tokenId: tokenMetadata.tokenId,
    type: AD_SLOT_TYPE.USER_GENERATED,
    url: submission.url,
  });

  return {
    description: content.description,
    imageUrl: content.imageUrl,
    submissionStatus: mapSubmissionStatus(content.submissionStatus),
    title: content.title,
    url: content.url,
  };
};

module.exports = saveAdSlotContentSubmission;
