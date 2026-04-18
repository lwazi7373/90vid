const redis = require("./redisClient");

const DEFAULT_TTL = 300; // 5 minutes

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
  setCache,
  getCache,
  deleteCache,
};