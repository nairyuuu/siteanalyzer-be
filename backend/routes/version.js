const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const VERSION_FILE_PATH = path.join(__dirname, 'shared/version.txt');

router.get('/', (req, res) => {
  fs.readFile(VERSION_FILE_PATH, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading version file:', err);
      return res.status(500).json({ error: 'Failed to read version file' });
    }
    res.json({ version: data.trim() });
  });
});

module.exports = router;