const express = require('express');
const router = express.Router();
const path = require('path');
const authMiddleware = require('../middleware/auth');

// Check if the user is authenticated before allowing the download
router.get('/', authMiddleware, (req, res) => {
    const file = path.join(__dirname, 'shared/site-analyzer-main.zip');
    if (!file) {
        return res.status(404).json({ error: 'File not found' });
    }
    
    res.download(file, 'extension.zip');
});

module.exports = router;
