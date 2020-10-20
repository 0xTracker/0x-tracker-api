const { FILL_ATTRIBUTION_TYPE } = require('../constants');
const AttributionEntity = require('../model/attribution-entity');

const getAppBySlug = async urlSlug => {
  const attributionEntity = await AttributionEntity.findOne({
    urlSlug,
  }).lean();

  if (attributionEntity === null) {
    return null;
  }

  // If the attribution entity is not an "app" then return null
  if (
    !attributionEntity.mappings.some(
      m =>
        m.type === FILL_ATTRIBUTION_TYPE.CONSUMER ||
        m.type === FILL_ATTRIBUTION_TYPE.RELAYER,
    )
  ) {
    return null;
  }

  return attributionEntity;
};

module.exports = getAppBySlug;
