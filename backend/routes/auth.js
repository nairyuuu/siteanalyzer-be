const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const securityQuestions = require('../data/securityQuestions');
const router = express.Router(); 

router.post('/register', async (req, res) => {
  const { username, password, email, phone, address, securityAnswers } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  // Hash the answers
  const hashedAnswers = securityAnswers.map((answer) => ({
    questionId: answer.questionId,
    answerHash: bcrypt.hashSync(answer.answer, 8),
  }));

  try {
    const user = new User({
      username,
      password: hashedPassword,
      email,
      phone,
      address,
      securityAnswers: hashedAnswers,
    });
    await user.save();
    res.json({ message: 'Registered successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

// Endpoint to get predefined security questions
router.get('/security-questions', (req, res) => {
  res.json(securityQuestions);
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ username }, 'secret', { expiresIn: '1h' });
  res.json({ token });
});

router.post('/forgot-password', async (req, res) => {
  const { username, securityAnswers } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    bcrypt.hashSync('dummy', 8); // Dummy hash to prevent timing attacks
    return res.status(404).json({ error: 'User not found' });
  }

  const isValid = securityAnswers.every((answer) => {
    const storedAnswer = user.securityAnswers.find(
      (sa) => sa.questionId === answer.questionId
    );
    return storedAnswer && bcrypt.compareSync(answer.answer, storedAnswer.answerHash);
  });

  if (!isValid) {
    return res.status(401).json({ error: 'Security answers do not match' });
  }

  // Generate a password reset token
  const resetToken = jwt.sign({ username: user.username }, process.env.SECRET_KEY, {
    expiresIn: '15m', // Token expires in 15 minutes
  });

  // Send the token in the response (in a real-world scenario, you would email this token)
  res.json({
    message: 'Security answers verified. Use the token to reset your password.',
    resetToken,
  });
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  try {
    // Verify the reset token
    const decoded = jwt.verify(token, process.env.SECRET_KEY); // Replace 'secret' with your JWT secret
    const user = await User.findOne({ username: decoded.username });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Hash the new password
    const hashedPassword = bcrypt.hashSync(password, 8);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid or expired token.' });
  }
});

module.exports = router;
