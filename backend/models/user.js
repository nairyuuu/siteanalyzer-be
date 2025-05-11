const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  email: String,
  phone: String,
  address: String,
  role: { type: String, default: 'user' }, // Add role field
});

module.exports = mongoose.model('User', UserSchema);
