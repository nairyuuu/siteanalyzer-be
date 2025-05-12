const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { trafficLogger } = require('./utils/trafficLogger');
const { initializeWebSocket } = require('./utils/websocket');
const rateLimiter = require('./utils/rateLimit');
const helmet = require('helmet');
const http = require('http');

const app = express();
const server = http.createServer(app);

mongoose.connect('mongodb://mongo:27017/extensionDB');

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(trafficLogger);

app.use("/api", rateLimiter());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/download', require('./routes/download'));
app.use('/api/version', require('./routes/version'));
app.use('/api/dashboard', require('./routes/dashboard'));

initializeWebSocket(server);

const PORT = 4000;
server.listen(PORT, () => console.log(`Backend and WebSocket server running on port ${PORT}`));
