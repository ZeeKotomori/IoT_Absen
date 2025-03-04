import { Queue, Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const connection = new Redis({
    host: '127.0.0.1',
    port: 6379,
    maxRetriesPerRequest: null,
    enableReadyCheck: false
});

export const absensiQueue = new Queue("absensiQueue", { connection });
const prisma = new PrismaClient();

const worker = new Worker("absensiQueue", async (job) => {
    const { rfid, date } = job.data;

    console.log(`Memproses absensi untuk RFID: ${rfid} pada ${date}`);

    await prisma.attendance.create({
        data : {
            rfid,
            date,
        }
    });

    console.log(`Absensi untuk RFID ${rfid} berhasil disimpan.`);


}, { connection });

console.log("🤖 Worker running!");