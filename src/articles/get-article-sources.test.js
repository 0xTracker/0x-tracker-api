const getArticleSources = require('./get-article-sources');

it('should get all article sources', () => {
  const sources = getArticleSources();

  expect(sources).toMatchSnapshot();
});
