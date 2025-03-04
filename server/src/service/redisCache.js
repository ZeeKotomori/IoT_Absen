import redis from "ioredis";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const redisClient = new redis();

export const getUserByRFID = async (rfid) => {
    try {
        const cachedUser = await redisClient.get(rfid);
        if (cachedUser) {
            console.log("Data dari Redis");
            return JSON.parse(cachedUser);
        }

        const user = await prisma.student.findUnique({
            where : { rfid : rfid },
        });

        if (user) {
            await redisClient.set(`user:${rfid}`, JSON.stringify(user), "EX", 82800); // set 23 jam
        }

        return user;
    } catch (error) {
        
    }
}