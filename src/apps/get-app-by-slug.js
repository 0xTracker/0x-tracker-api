const { FILL_ATTRIBUTION_TYPE } = require('../constants');
const AttributionEntity = require('../model/attribution-entity');

const getAppBySlug = async slug => {
  const attributionEntity = await AttributionEntity.findOne({
    urlSlug: slug,
  }).lean();

  if (
    !attributionEntity.mappings.some(
      m =>
        m.type === FILL_ATTRIBUTION_TYPE.CONSUMER ||
        m.type === FILL_ATTRIBUTION_TYPE.RELAYER,
    )
  ) {
    return undefined;
  }

  return attributionEntity;
};

module.exports = getAppBySlug;
