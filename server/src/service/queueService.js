import { attendanceQueue } from "../../config/bullmq.js";
import { getNextErrorIndex, logger } from "../utils/logger.js";

const infoId = getNextErrorIndex();

export const scheduleJobs = async () => {
    await attendanceQueue.add('pullAbsent', {}, { repeat : { cron : '27 23 * * *' }});
    await attendanceQueue.add('markAbsent', {}, { repeat : { cron : '0 10 * * *' }});
    await attendanceQueue.add('saveAbsentToDb', {}, { repeat : { cron : '0 18 * * *' }});
    logger.info({ level : "info", message : "✅ Job BullMQ berhasil dijadwalkan!" , id : infoId});
}