const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const redisClient = require("../config/redis"); // Your existing Redis client

//  General Global Rate Limiter (e.g., 100 requests per 15 minutes per IP)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message:
      "Too many requests from this IP. Please try again after 15 minutes.",
  },
  // Connect to your Redis client so rate limits persist
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: "rl:global:", // Unique prefix for Redis keys
  }),
});

// Strict Auth Limiter (for Login / OTP / Registration routes to prevent brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false, // Disable legacy headers
  message: {
    success: false,
    message:
      "Too many failed login attempts. Please try again after 15 minutes.",
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: "rl:auth:",
  }),
});

//  Driver Location / Polling Limiter (for rapid requests )
const pollingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Max 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Polling rate limit exceeded.",
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: "rl:polling:",
  }),
});

module.exports = {
  globalLimiter,
  authLimiter,
  pollingLimiter,
};
