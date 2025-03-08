import { attendanceQueue } from "../../config/bullMq.js";
import { logger } from "../utils/logger.js";

export const scheduleJobs = async () => {
    await attendanceQueue.add('pullAbsent', {}, { repeat : { cron : '0 0 * * *' }});
    await attendanceQueue.add('markAbsent', {}, { repeat : { cron : '0 10 * * *' }});
    await attendanceQueue.add('saveAbsentToDb', {}, { repeat : { cron : '0 18 * * *' }});
    logger.info("✅ Job BullMQ berhasil dijadwalkan!");
}