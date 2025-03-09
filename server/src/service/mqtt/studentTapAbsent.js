import prisma from "../../../config/prisma.js";
import { redis } from "../../../config/redis.js";
import { logger } from "../../utils/logger.js";

const today = new Date().toISOString().split("T")[0];

export const absentStudentByRFID = async (rfid) => {
    try {
        const cachedUser = await redis.hget(`kehadiran:${rfid}`);
        if (!cachedUser || Object.keys(cachedUser).length === 0) {
            logger.info("Tidak ada data dari Redis");
            return null;
        }

        const timeNow = new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });

        const [hourNow, minuteNow] = timeNow.split(":").map(Number);
        const totalMinutesNow = hourNow * 60 + minuteNow;

        const lateHour = 7;
        const lateMinute = 15;
        const totalMinutesLate = lateHour * 60 + lateMinute;

        const status = totalMinutesNow > totalMinutesLate ? "TERLAMBAT" : "HADIR";

        const user = await prisma.attendance.update({
            data: {
                status: status,
                date: today,
                time_in: timeNow
            }
        });

        return user;
    } catch (error) {
        let errorId = getNextErrorIndex();
        logger.error({ message: `Error Absent By Rfid: ${error.message}`, errorId });
        return null;
    }
}