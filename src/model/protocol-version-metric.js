const mongoose = require('mongoose');

const { Schema } = mongoose;

const metricShape = {
  date: Date,
  fillCount: Schema.Types.Mixed,
  fillVolume: Schema.Types.Mixed,
};

const schema = mongoose.Schema({
  ...metricShape,
  protocolVersion: Number,
  date: { index: 1, type: Date },
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

const Model = mongoose.model('ProtocolVersionMetric', schema);

module.exports = Model;
