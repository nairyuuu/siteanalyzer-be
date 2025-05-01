const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  email: String,
  phone: String,
  address: String,
  securityAnswers: [
    {
      questionId: Number, // Reference to predefined question
      answerHash: String, // Hashed answer
    },
  ],
});

module.exports = mongoose.model('User', UserSchema);
