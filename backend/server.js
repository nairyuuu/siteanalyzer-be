require('dotenv').config(); // Ensure environment variables are loaded
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { trafficLogger } = require('./utils/trafficLogger');
const { initializeWebSocket } = require('./utils/websocket');
const rateLimiter = require('./utils/rateLimit');
const helmet = require('helmet');
const http = require('http');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const csrfProtection = csurf({ cookie: true });

const app = express();
const server = http.createServer(app);

// Load the allowed origin from the environment variable
const allowedOrigin = [`${process.env.CORS_ORIGIN}`];

// Configure CORS
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Allow cookies and credentials
}));

mongoose.connect('mongodb://mongo:27017/extensionDB');

app.use(express.json());
app.use(helmet());
app.use(trafficLogger);
app.use(cookieParser());

app.use("/api", rateLimiter());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/download', require('./routes/download'));
app.use('/api/version', require('./routes/version'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.get('/api/csrf-token',csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

initializeWebSocket(server);

const PORT = 4000;
server.listen(PORT, () => console.log(`Backend and WebSocket server running on port ${PORT}`));
