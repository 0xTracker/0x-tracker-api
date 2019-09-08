const mongoose = require('mongoose');

const { Schema } = mongoose;

const metricShape = {
  date: Date,
  fillCount: Schema.Types.Mixed,
  fillVolume: Schema.Types.Mixed,
};

const schema = mongoose.Schema({
  ...metricShape,
  address: String,
  date: Date,
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

const Model = mongoose.model('AddressMetric', schema);

module.exports = Model;
