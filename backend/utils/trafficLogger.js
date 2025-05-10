const TrafficLog = require('../models/TrafficLog');
const { broadcastLogUpdate } = require('./websocket'); // Import WebSocket broadcast function

// Middleware to log traffic and broadcast updates
const trafficLogger = async (req, res, next) => {
  const endpoint = req.originalUrl;
  const method = req.method;
  const ip = req.ip;
  const timestamp = new Date().toISOString();

  const originalSend = res.send;
  res.send = async function (body) {
    const statusCode = res.statusCode;

    // Save the traffic log to the database and broadcast it
    try {
      const log = {
        timestamp,
        ip,
        method,
        endpoint,
        statusCode,
      };
      const savedLog = await TrafficLog.create(log);
      broadcastLogUpdate(savedLog); // Broadcast the new log
    } catch (err) {
      console.error('Failed to save and broadcast log:', err);
    }

    // Call the original `send` method
    return originalSend.call(this, body);
  };

  next();
};

module.exports = { trafficLogger };