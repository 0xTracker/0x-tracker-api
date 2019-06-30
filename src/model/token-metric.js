const mongoose = require('mongoose');

const metricShape = {
  date: Date,
  fillCount: Number,
  tokenVolume: Number,
  usdVolume: Number,
};

const schema = mongoose.Schema({
  ...metricShape,
  date: Date,
  tokenAddress: String,
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

const Model = mongoose.model('TokenMetric', schema);

module.exports = Model;
