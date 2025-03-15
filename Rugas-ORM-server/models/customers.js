const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: String,
  phoneNumber: String,
});

module.exports = mongoose.model('Customer', customerSchema);