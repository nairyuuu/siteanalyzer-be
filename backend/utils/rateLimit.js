const rateLimit = require('express-rate-limit');

// Define and export a function to create a rate limiter
function rateLimiter() {
    return rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10, // Limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later.',
    });
}

module.exports = rateLimiter;
