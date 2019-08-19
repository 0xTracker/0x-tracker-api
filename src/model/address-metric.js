const mongoose = require('mongoose');

const metricShape = {
  date: Date,
  fillCount: Number,
  fillVolume: Number,
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
