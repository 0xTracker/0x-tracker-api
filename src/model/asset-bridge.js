const mongoose = require('mongoose');

const schema = mongoose.Schema({
  address: String,
  imageUrl: String,
  name: String,
  slug: String,
});

const AssetBridge = mongoose.model('AssetBridge', schema);

module.exports = AssetBridge;
