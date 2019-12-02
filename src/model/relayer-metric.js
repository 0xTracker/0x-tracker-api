const mongoose = require('mongoose');

const metricShape = {
  date: Date,
  fillCount: Number,
  fillVolume: Number,
  protocolFees: {
    USD: Number,
    ZRX: Number,
  },
  tradeCount: Number,
  tradeVolume: Number,
};

const schema = mongoose.Schema({
  ...metricShape,
  relayerId: Number,
  hours: [
    {
      ...metricShape,
      minutes: [
        {
          ...metricShape,
        },
      ],
    },
  ],
});

const Model = mongoose.model('RelayerMetric', schema);

module.exports = Model;
