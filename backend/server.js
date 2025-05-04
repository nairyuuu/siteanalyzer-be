const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

mongoose.connect('mongodb://mongo:27017/extensionDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/download', require('./routes/download'));
app.use('/api/version', require('./routes/version'));

const PORT = 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
