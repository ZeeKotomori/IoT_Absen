import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import pullAttendanceJob from "./jobs/pullAttendanceJob.js";
import markAbsentJob from "./jobs/markAbsentJob.js";
import saveAttendanceJob from "./jobs/saveAttendanceJob.js";
import { getNextErrorIndex, logger } from "./utils/logger.js";

const worker = new Worker(
    "attendanceQueue",
    async (job) => {
        if (job.name === "pullAbsent") await pullAttendanceJob();
        if (job.name === "markAbsent") await markAbsentJob();
        if (job.name === "saveAbsentToDb") await saveAttendanceJob();
    }, { connection : redis }
);
const infoId = getNextErrorIndex();
logger.info({level : "info", message :"👷 Worker berjalan dan siap menerima job!" , id : infoId});