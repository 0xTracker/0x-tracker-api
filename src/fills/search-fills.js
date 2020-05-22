const buildFillsQuery = require('../fills/build-fills-query');
const elasticsearch = require('../util/elasticsearch');
const Fill = require('../model/fill');

const searchFills = async (params, options) => {
  const results = await elasticsearch.getClient().search({
    index: 'fills',
    body: {
      _source: false,
      from: (options.page - 1) * options.limit,
      query: buildFillsQuery(params),
      size: options.limit,
      sort: [{ date: 'desc' }],
      track_total_hits: true,
    },
  });

  const resultCount = results.body.hits.total.value;
  const fillIds = results.body.hits.hits.map(hit => hit._id);
  const fills = await Fill.find({ _id: { $in: fillIds } })
    .populate([
      { path: 'relayer', select: 'imageUrl name slug' },
      { path: 'assets.token', select: 'decimals name symbol type' },
      { path: 'fees.token', select: 'decimals name symbol type' },
    ])
    .sort({ date: -1 });

  return {
    docs: fills,
    pages: Math.ceil(resultCount / options.limit),
    total: resultCount,
  };
};

module.exports = searchFills;
