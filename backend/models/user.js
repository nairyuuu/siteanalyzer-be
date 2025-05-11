const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  email: String,
  phone: String,
  address: String
});

module.exports = mongoose.model('User', UserSchema);
