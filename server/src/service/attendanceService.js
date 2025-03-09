import { getNextErrorIndex, logger } from "../utils/logger.js"
import { redis } from "../../config/redis.js";
import prisma from "../../config/prisma.js";

export const schedulePulling = async () => {
    try {
        const infoId = getNextErrorIndex()
        logger.info({ level : "info", message : "🔄 Pulling data kehadiran dari database ke Redis", id : infoId });
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let page = 0;
        let pageSize = 500;

        while (true) {
            const students = await prisma.user.findMany({
                where: { role: "STUDENT" },
                select: {
                    id: true,
                    Attendance: true,
                    Student: {
                        select: {
                            id : true,
                            rfid: true
                        }
                    }
                },
                skip: page * pageSize,
                take: pageSize
            });

            if (students.length === 0) break;
            
            const redisPipeline = redis.pipeline();

            for (const student of students) {
                const existingAttendance = await prisma.attendance.findFirst({
                    where: {
                        studentId: student.Student.id,
                        date : today
                    },
                });

                if (!existingAttendance) {
                    await prisma.attendance.create({
                        data: {
                            studentId: student.Student.id,
                            status: "BELUM_HADIR",
                            date: today
                        }
                    });
                }

                if (student.Student) redisPipeline.hset(`kehadiran:${student.Student.rfid}`, 'status', "BELUM_HADIR", 'studentId', student.id);
            }

            await redisPipeline.exec();
            page++;
        }

        logger.info({ level : "info", message : "✅ Pulling data selesai!", id : infoId});
    } catch (error) {
        let errorId = getNextErrorIndex();
        logger.error({ level: "error", message: `Error Pulling Data: ${error.message}`, id : errorId });
    }
}

export const markAbsent = async () => {
    try {
        const infoId = getNextErrorIndex()
        logger.info({ level : "info", message : "🔄 Memeriksa kehadiran di Redis untuk update status...", id : infoId});

        const keys = await redis.keys("kehadiran:*");
        const redisPipeline = redis.pipeline();

        for (const key of keys) {
            redisPipeline.hget(key, "status");
        }

        const results = await redisPipeline.exec();

        const updatePipeline = redis.pipeline();
        results.forEach(([err, status], index) => {
            if (status === "BELUM_HADIR") {
                updatePipeline.hset(keys[index], "status", "ALPA");
            }
        });

        await updatePipeline.exec();

        logger.info({ level: "info", message : `✅ Status kehadiran diperbarui.`, id : infoId });
    } catch (error) {
        let errorId = getNextErrorIndex();
        logger.error({ level: "error", message: `Error Mark Data: ${error.message}`, id : errorId });
    }
}

export const saveAbsentToDb = async () => {
    try {
        const infoId = getNextErrorIndex();
        logger.info({ level : "info", message : "🔄 Menyimpan kehadiran ke database...", id : infoId });

        const keys = await redis.keys("Kehadiran:*");
        if (keys.length === 0) return;

        const redisPipeline = redis.pipeline();
        keys.forEach((key) => redisPipeline.hget(key, "status"));

        const results = await redisPipeline.exec();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const updateData = results.map(([err, data], index) => ({
            rfid: keys[index].split(":")[1],
            status: data.status,
        }));

        const studentData = await prisma.student.findMany({
            where: {
                rfid: { in: updateData.map((data) => data.rfid) }
            },
            select: { userId: true, rfid: true }
        });

        const rfidToUserId = Object.fromEntries(
            studentData.map((s) => [s.rfid, s.userId])
        );

        await prisma.$transaction(
            updateData.map((data) =>
                prisma.attendance.updateMany({
                    where: { userId: rfidToUserId[data.rfid], date: today },
                    data: { status: data.status },
                })
            )
        );

        await redis.del(...keys);

        logger.info({level : "info", message : `✅ Kehadiran berhasil disimpan dan Redis dikosongkan.`, id : infoId});
    } catch (error) {
        let errorId = getNextErrorIndex();
        logger.error({ level: "error", message: `Error Save Data to Database: ${error.message}`, id : errorId });
    }
}