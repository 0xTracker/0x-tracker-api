const transformRelayer = (relayer, stats) => {
  return {
    id: relayer.id,
    imageUrl: relayer.imageUrl,
    name: relayer.name,
    slug: relayer.slug,
    stats,
    url: relayer.url,
  };
};

module.exports = transformRelayer;
