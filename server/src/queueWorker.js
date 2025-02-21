import { Queue, Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const connection = new Redis("redis://localhost:6379");
export const absensiQueue = new Queue("absensiQueue", { connection });
const prisma = new PrismaClient();

const worker = new Worker("absensiQueue", async (job) => {
    const { kartu_id, siswa_id } = job.data;

    const lastAbsensi = await prisma.absensi.findFirst({
        where : {
            siswa_id,
            waktu_absen : {
                gte : new Date(new Date() - 5 * 60 * 1000),
            },
        },
    });

    if (!lastAbsensi) {
        await prisma.absensi.create({
            data : {
                kartu_id,
                siswa_id,
                waktu_absen : new Date(),
            },
        });

        console.log(`🤖 Absensi ${siswa_id} dengan berhasil!`);
    } else {
        console.log(`🤖 Siswa ${siswa_id} sudah absen dalam 5 menit terakhir`);
    }
}, { connection });

console.log("🤖 Worker running!");