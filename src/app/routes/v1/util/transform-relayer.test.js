const starBit = require('../../../../fixtures/relayers/star-bit');
const transformRelayer = require('./transform-relayer');

const stats = {
  tradeVolume: 150567.87,
  tradeCount: 512,
};

describe('transformRelayer', () => {
  it('should transfer relayer with stats', () => {
    const transformed = transformRelayer(starBit, stats);

    expect(transformed).toMatchSnapshot();
  });

  it('should transform relayer without stats', () => {
    const transformed = transformRelayer(starBit);

    expect(transformed).toMatchSnapshot();
  });

  it('should transform relayer with minimal fields', () => {
    const transformed = transformRelayer(
      { ...starBit, imageUrl: undefined, url: undefined },
      stats,
    );

    expect(transformed).toMatchSnapshot();
  });
});
