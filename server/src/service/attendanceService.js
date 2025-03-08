import { getNextErrorIndex, logger } from "../utils/logger.js"
import { redis } from "../../config/redis.js";
import prisma from "../../config/prisma.js";

export const schedulePulling = async () => {
    try {
        logger.info("🔄 Pulling data kehadiran dari database ke Redis");
        const today = new Date().toISOString().split("T")[0];

        let page = 0;
        let pageSize = 500;

        while (true) {
            const students = await prisma.user.findMany({
                where: { role: "STUDENT" },
                select: {
                    id: true,
                    Attendance: true,
                    Student: {
                        select: { rfid: true }
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
                        userId: student.id,
                        date: today,
                    },
                });

                if (!existingAttendance) {
                    await prisma.attendance.create({
                        data: {
                            studentId: student.id,
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

        logger.info("✅ Pulling data selesai!");
    } catch (error) {
        const errorId = getNextErrorIndex();
        logger.error({ message: `Error pulling kehadiran: ${error.message}`, errorId });
    }
}

export const markAbsent = async () => {
    try {
        logger.info("🔄 Memeriksa kehadiran di Redis untuk update status...");

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

        logger.info(`✅ Status kehadiran diperbarui.`);
    } catch (error) {
        const errorId = getNextErrorIndex();
        logger.error({ message: `Error update kehadiran: ${error.message}`, errorId });
    }
}

export const saveAbsentToDb = async () => {
    try {
        logger.info("🔄 Menyimpan kehadiran ke database...");

        const keys = await redis.keys("Kehadiran:*");
        if (keys.length === 0) return;

        const redisPipeline = redis.pipeline();
        keys.forEach((key) => redisPipeline.hget(key, "status"));

        const results = await redisPipeline.exec();
        const today = new Date().toISOString().split("T")[0];

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

        logger.info(`✅ Kehadiran berhasil disimpan dan Redis dikosongkan.`);
    } catch (error) {
        const errorId = getNextErrorIndex();
        logger.error({ message: `Error save kehadiran: ${error.message}`, errorId });
    }
}