const express = require('express');
const jwt = require('jsonwebtoken');
const csurf = require('csurf');
const User = require('../models/user');
const TrafficLog = require('../models/TrafficLog');
const router = express.Router();

const csrfProtection = csurf({ cookie: true });

const isAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided or invalid format' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.SECRET_KEY || 'secret');

    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error('Error in isAdmin middleware:', err.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};


router.get('/',isAdmin , async (req, res) => {
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

router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/users/:id/role', csrfProtection, isAdmin, async (req, res) => {
  const { role } = req.body;
  const { id } = req.params;

  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }

  try {
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'Role updated successfully', user });
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/users/:id', csrfProtection, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;