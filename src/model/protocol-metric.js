const mongoose = require('mongoose');

const metricShape = {
  date: Date,
  fillCount: Number,
  fillVolume: Number,
};

const schema = mongoose.Schema({
  ...metricShape,
  protocolVersion: Number,
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

const Model = mongoose.model('ProtocolMetric', schema);

module.exports = Model;
