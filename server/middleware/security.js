const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// 1. Helmet HTTP Security Headers
const helmetMiddleware = helmet({
  contentSecurityPolicy: false, // Disabled for local dev flexibility with Three.js WebGL & WebSockets
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

// 2. Dynamic & Secure CORS Configuration
const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// 3. Strict Rate Limiting for Auth Endpoints
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 requests per 15 min window per IP
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 4. General API Rate Limiting
const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // max 100 requests per minute
  message: { error: 'API rate limit exceeded. Cooling down quantum buffer.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  helmetMiddleware,
  corsMiddleware: cors(corsOptions),
  authRateLimiter,
  apiRateLimiter
};
