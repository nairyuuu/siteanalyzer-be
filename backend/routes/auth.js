require('dotenv').config(); 

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user')
const nodemailer = require('nodemailer');
const validator = require('validator'); // Add validator.js for input validation
const securityQuestions = require('../middleware/data/securityQuestions')
const router = express.Router(); 


const transporter = nodemailer.createTransport({
  service: 'Gmail', // Use your email service
  host: "smtp.gmail.com",
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});


router.post('/register', async (req, res) => {
  const { username, password, email, phone, address, role } = req.body;

  // Validate inputs
  if (!validator.isAlphanumeric(username)) {
    return res.status(400).json({ error: 'Invalid username. Only alphanumeric characters are allowed.' });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }
  if (!validator.isMobilePhone(phone, 'any')) {
    return res.status(400).json({ error: 'Invalid phone number.' });
  }
  if (!validator.isLength(password, { min: 8 })) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  const hashedPassword = bcrypt.hashSync(password, 8);

  try {
    const user = new User({
      username,
      password: hashedPassword,
      email,
      phone,
      address,
      role: role || 'user', // Default to 'user' if role is not provided
    });
    await user.save();
    res.json({ message: 'Registered successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
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
  const token = jwt.sign({ username }, process.env.SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

router.post('/forgot-password', async (req, res) => {
  const { username } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate a password reset token
    const resetToken = jwt.sign({ username: user.username }, process.env.SECRET_KEY, {
      expiresIn: '15m', // Token expires in 15 minutes
    });
    console.log('Generated reset token:', resetToken);
    // Construct the password reset link
    const resetLink = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Send the reset link via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Password reset email sent. Please check your inbox.' });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ error: 'Failed to send email. Please try again later.' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  console.log('Received token:', token);
  try {
    // Verify the reset token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log('Decoded token:', decoded);

    // Find the user by username
    const user = await User.findOne({ username: decoded.username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash the new password
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password reset successfully.' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(400).json({ error: 'Invalid or expired token.' });
  }
});

module.exports = router;
