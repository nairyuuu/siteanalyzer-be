const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  email: String,
  phone: String,
  address: String,
  securityQuestions: [
    {
      question: String,
      answerHash: String
    }
  ]
});

module.exports = mongoose.model('User', UserSchema);
