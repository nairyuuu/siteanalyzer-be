const { 
  Server } = require('ws');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const TrafficLog = require('../models/TrafficLog');

let wss; // WebSocket server instance

function initializeWebSocket(server) {
  wss = new WebSocketServer({ server });

  wss.on('connection', async (ws, req) => {
    const token = req.headers['sec-websocket-protocol'];

    if (!token || typeof token !== 'string') {
      console.log('WebSocket connection rejected: No token provided or invalid format');
      ws.close(1008, 'Unauthorized');
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY || 'secret');
      const user = await User.findOne({ username: decoded.username });

      if (!user || user.role !== 'admin') {
        console.log('WebSocket connection rejected: Unauthorized user');
        ws.close(1008, 'Unauthorized');
        return;
      }

      TrafficLog.find().sort({ timestamp: -1 }).limit(100).then((logs) => {
        ws.send(JSON.stringify({ type: 'initial', logs }));
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
      });
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        console.error('WebSocket connection rejected: Token expired');
        ws.close(4001, 'Token expired'); // Custom close code for expired tokens
      } else {
        console.error('WebSocket connection rejected: Invalid token', err.message);
        ws.close(1008, 'Unauthorized');
      }
    }
  });
}

// Broadcast function to send updates to all connected clients
function broadcastLogUpdate(log) {
  if (!wss) {
    console.error('WebSocket server is not initialized');
    return;
  }

  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify({ type: 'update', log }));
    }
  });
}

module.exports = { initializeWebSocket, broadcastLogUpdate };