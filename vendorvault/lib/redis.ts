import Redis from "ioredis";

// Create Redis connection
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
});

// Handle connection events
redis.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

redis.on("ready", () => {
  console.log("🚀 Redis is ready to accept commands");
});

export default redis;
