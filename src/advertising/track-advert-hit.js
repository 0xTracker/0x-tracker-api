const elasticsearch = require('../util/elasticsearch');

const trackAdvertHit = async (advertContentId, metadata) => {
  await elasticsearch.getClient().index({
    index: 'advert_hits',
    body: {
      advertContentId,
      date: Date.now(),
      origin: metadata.origin,
      referer: metadata.referer,
      userAgent: metadata.userAgent,
    },
  });
};

module.exports = trackAdvertHit;
