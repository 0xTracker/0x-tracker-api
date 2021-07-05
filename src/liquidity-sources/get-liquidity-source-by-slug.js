const { FILL_ATTRIBUTION_TYPE } = require('../constants');
const AttributionEntity = require('../model/attribution-entity');

const getLiquiditySourceBySlug = async urlSlug => {
  const attributionEntity = await AttributionEntity.findOne({
    urlSlug,
  }).lean();

  if (attributionEntity === null) {
    return null;
  }

  if (
    !attributionEntity.mappings.some(
      m => m.type === FILL_ATTRIBUTION_TYPE.LIQUIDITY_SOURCE,
    )
  ) {
    return null;
  }

  return attributionEntity;
};

module.exports = getLiquiditySourceBySlug;
