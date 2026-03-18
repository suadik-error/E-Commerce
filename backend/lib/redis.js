import "./env.js";
import Redis from "ioredis";
if (!process.env.UPSTASH_REDIS_URL) {
  console.warn("UPSTASH_REDIS_URL is not set. Redis features will be unavailable.");
}

export const redis = new Redis(process.env.UPSTASH_REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

redis.on('ready', () => {
  console.log('Redis client ready');
});

redis.on('close', () => {
  console.log('Redis connection closed');
});

redis.connect().catch((err) => {
  console.error("Redis initial connection failed:", err.message);
});
