const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY || 'secret');
    req.user = decoded; // Attach the decoded user information to the request
    next();
  } catch (err) {
    console.error('Invalid token:', err.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};