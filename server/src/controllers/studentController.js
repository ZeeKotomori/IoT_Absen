import prisma from "../../config/prisma";
import { redis } from "../../config/redis";
import { getNextErrorIndex, logger } from "../utils/logger";

const getExpireTime = async () => {
    const now = new Date();
    const expireTime = new Date(now);
    expireTime.setHours(23, 0, 0, 0);
    return Math.floor(expireTime.getTime() / 1000);
}

const setCacheWithExpiry = async (key , value ) => {
    const expireAt = getExpireTime();
    await redis.set(key, value);
    await redis.expireat(key, expireAt);
}

export const getTotalStudentsOnCount = async (req, res) => {
    try {
        let totalStudents = await redis.get('total_students');

        if (!totalStudents) {
            totalStudents = await prisma.student.count();
            await setCacheWithExpiry('total_students', totalStudents);
        }

        return res.status(200).send({ message : "Total : ", totalStudents });
    } catch (error) {
        const errorId = getNextErrorIndex();
        logger.error({ level : "error", message : `Error getSubjectTeachers: ${error.message}`, id : errorId});
        return res.status(500).send({ message : "Internal Server Error", errorId });
    }
}