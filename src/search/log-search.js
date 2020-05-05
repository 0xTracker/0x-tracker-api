const slugify = require('slugify');

const elasticsearch = require('../util/elasticsearch');

const logSearch = async (terms, date) => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const logDate = new Date();

  logDate.setTime(Date.UTC(year, month, day, hour));

  const slug = slugify(terms, { replacement: '_', lower: true, strict: true });

  await elasticsearch.getClient().update({
    id: `${year}_${month + 1}_${day}_${hour}_${slug}`,
    index: 'search_terms',
    body: {
      script: {
        lang: 'painless',
        source: 'ctx._source.hits += 1',
      },
      upsert: {
        date: logDate,
        hits: 1,
        terms,
      },
    },
  });
};

module.exports = logSearch;
