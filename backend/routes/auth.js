const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password, email, phone, address, securityQuestions } = req.body;
  const hashed = bcrypt.hashSync(password, 8);
  const hashedQuestions = securityQuestions.map(q => ({
    question: q.question,
    answerHash: bcrypt.hashSync(q.answer, 8)
  }));
  try {
    const user = new User({ 
      username, 
      password: hashed, 
      email, 
      phone, 
      address, 
      securityQuestions: hashedQuestions 
    });
    await user.save();
    res.json({ message: 'Registered successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Username already exists' });
  }
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
  const { username, securityQuestions } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    bcrypt.hashSync('dummy', 8); // Dummy hash to prevent timing attacks
    return res.status(404).json({ error: 'User not found' });
  }

  const isValid = securityQuestions.every(q => {
    const storedQuestion = user.securityQuestions.find(sq => sq.question === q.question);
    return storedQuestion && bcrypt.compareSync(q.answer, storedQuestion.answerHash);
  });

  if (!isValid) {
    return res.status(401).json({ error: 'Security answers do not match' });
  }

  res.json({ message: 'Security answers verified. You can now reset your password.' });
});

module.exports = router;
