import IORedis from "ioredis";

export const redis = new IORedis({
    host: "127.0.0.1",
    port: 6379,
});

redis.on("error", (err) => console.error("❌ Redis Error:", err));