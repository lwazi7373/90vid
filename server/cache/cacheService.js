const redis = require("./redisClient");

const DEFAULT_TTL = 300; // 5 minutes

const increment = async (key) => {
  if (!redis || !redis.isOpen) return null;

  return await redis.incr(key);
};

const setExpiry = async (key, seconds) => {
  if (!redis || !redis.isOpen) return;

  await redis.expire(key, seconds);
};

const setCache = async (key, value, ttl = DEFAULT_TTL) => {
  await redis.set(key, JSON.stringify(value), {
    EX: ttl,
  });
};

const getCache = async (key) => {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

const deleteCache = async (key) => {
  await redis.del(key);
};

module.exports = {
  increment,
  setExpiry,
  setCache,
  getCache,
  deleteCache,
};