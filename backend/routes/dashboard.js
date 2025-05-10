const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const TrafficLog = require('../models/TrafficLog'); 
const router = express.Router();

router.get('/', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY || 'secret');
    const user = await User.findOne({ username: decoded.username });

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const logs = await TrafficLog.find().sort({ timestamp: -1 }).limit(100);

    res.json({
      message: 'Admin Dashboard',
      logs,
    });
  } catch (err) {
    console.error('Error in dashboard route:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;