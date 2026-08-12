// config/redis.js
const redis = require("redis");

// Create a Redis client (defaults to localhost:6379)
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.on("connect", () => console.log("Redis connected successfully"));

// Connect to Redis
redisClient.connect().catch(console.error);

module.exports = redisClient;
