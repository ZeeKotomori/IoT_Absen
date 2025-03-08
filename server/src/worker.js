import { Worker } from "bullmq";
import { redis } from "../config/redis";
import pullAttendanceJob from "./jobs/pullAttendanceJob";
import markAbsentJob from "./jobs/markAbsentJob";
import saveAttendanceJob from "./jobs/saveAttendanceJob";
import { logger } from "./utils/logger";

const worker = new Worker(
    "attendanceQueue",
    async (job) => {
        if (job.name === "pullAbsent") await pullAttendanceJob();
        if (job.name === "markAbsent") await markAbsentJob();
        if (job.name === "saveAbsentToDb") await saveAttendanceJob();
    }, { connection : redis }
);

logger.info("👷 Worker berjalan dan siap menerima job!")