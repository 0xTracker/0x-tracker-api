const mongoose = require('mongoose');

const schema = mongoose.Schema({
  address: String,
  imageUrl: String,
  name: String,
});

const Model = mongoose.model('AddressMetadata', schema);

module.exports = Model;
