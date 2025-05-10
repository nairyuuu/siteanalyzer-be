const { WebSocketServer } = require('ws');
const TrafficLog = require('../models/TrafficLog');

let wss; // WebSocket server instance

// Initialize WebSocket server
function initializeWebSocket(server) {
  wss = new WebSocketServer({ server });

  console.log('WebSocket server initialized');

  wss.on('connection', (ws) => {
    console.log('WebSocket connection established');

    // Send initial logs to the client
    TrafficLog.find().sort({ timestamp: -1 }).limit(100).then((logs) => {
      ws.send(JSON.stringify({ type: 'initial', logs }));
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
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