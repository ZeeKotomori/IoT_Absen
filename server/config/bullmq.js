import { Queue } from "bullmq";
import { redis } from "./redis.js";

export const attendanceQueue = new Queue("attendanceQueue", {
    connection: redis
});