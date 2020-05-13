const mongoose = require('mongoose');

const schema = mongoose.Schema({
  address: String,
  name: String,
});

const Model = mongoose.model('AddressMetadata', schema);

module.exports = Model;
