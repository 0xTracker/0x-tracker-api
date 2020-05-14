const { AD_SLOT_SUBMISSION_STATUS, AD_SLOT_TYPE } = require('./constants');
const AdSlotContent = require('../model/ad-slot-content');

const getContentForCurrentAdSlot = async () => {
  const ugContent = await AdSlotContent.findOne({
    dateFrom: { $lte: Date.now() },
    dateTo: { $gte: Date.now() },
    submissionStatus: AD_SLOT_SUBMISSION_STATUS.APPROVED,
    type: AD_SLOT_TYPE.USER_GENERATED,
  }).sort({ _id: -1 });

  if (ugContent !== null) {
    return [
      ugContent._id,
      {
        description: ugContent.description,
        imageUrl: ugContent.imageUrl,
        title: ugContent.title,
        url: ugContent.url,
      },
    ];
  }

  const fallbackCount = await AdSlotContent.countDocuments({
    dateFrom: { $lte: Date.now() },
    dateTo: { $gte: Date.now() },
    type: AD_SLOT_TYPE.FALLBACK,
  });

  const randomizer = Math.floor(Math.random() * fallbackCount);

  const fallbackContent = await AdSlotContent.find({
    dateFrom: { $lte: Date.now() },
    dateTo: { $gte: Date.now() },
    type: AD_SLOT_TYPE.FALLBACK,
  })
    .limit(1)
    .skip(randomizer);

  if (fallbackContent.length > 0) {
    return [
      fallbackContent[0]._id,
      {
        description: fallbackContent[0].description,
        imageUrl: fallbackContent[0].imageUrl,
        title: fallbackContent[0].title,
        url: fallbackContent[0].url,
      },
    ];
  }

  return null;
};

module.exports = getContentForCurrentAdSlot;
