const mongoose = require('mongoose');

const TrafficLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  ip: { type: String, required: true },
  method: { type: String, required: true },
  endpoint: { type: String, required: true },
  statusCode: { type: Number, required: true },
});

module.exports = mongoose.model('TrafficLog', TrafficLogSchema);