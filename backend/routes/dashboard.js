const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const TrafficLog = require('../models/TrafficLog');
const router = express.Router();

// Middleware to check if the user is an admin
const isAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY || 'secret');
    const user = await User.findOne({ username: decoded.username });

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    req.user = user; // Attach the user object to the request for further use
    next();
  } catch (err) {
    console.error('Error in isAdmin middleware:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

router.get('/', isAdmin, async (req, res) => {
  try {
    // Extract query parameters for pagination and filtering
    const { page = 1, limit = 20, method, statusCode, endpoint } = req.query;

    // Build the filter object dynamically based on query parameters
    const filter = {};
    if (method) filter.method = method;
    if (statusCode) filter.statusCode = parseInt(statusCode, 10);
    if (endpoint) filter.endpoint = { $regex: endpoint, $options: 'i' }; // Case-insensitive partial match

    // Calculate pagination values
    const skip = (page - 1) * limit;

    // Fetch logs with filtering, sorting, and pagination
    const logs = await TrafficLog.find(filter)
      .sort({ timestamp: -1 }) // Sort by timestamp in descending order
      .skip(skip)
      .limit(parseInt(limit, 10));

    // Get the total count of logs matching the filter
    const total = await TrafficLog.countDocuments(filter);

    // Respond with logs and pagination metadata
    res.json({
      message: 'Admin Dashboard',
      logs,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Error in dashboard route:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;