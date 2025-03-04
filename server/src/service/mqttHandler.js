import mqtt from 'mqtt';
import { getUserByRFID } from './redisCache.js';
import { absensiQueue } from './queueWorker.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const brokerUrl = 'mqtt://147.93.107.208:1883'; // Broker EMQX publik
const topic = '/esp32/ping';

const client = mqtt.connect(brokerUrl);

client.on('connect', () => {
    console.log('MQTT connected!');
    client.subscribe(topic, (err) => {
        if (err) {
            console.error('Error subscribing to topic', err);
        }
    });
});

client.on('message', async (topic, message) => {
    
    const scannedRFID = message.toString();
    console.log("RFID : " + scannedRFID);

    const user = await getUserByRFID(scannedRFID);
    console.log(user);
    if (user) {
        console.log(`${user.name} Ditemukan`);

        // Masukkan absensi ke antrian untuk diproses di background
        await absensiQueue.add("absensi", {
            rfid: scannedRFID,
            date: new Date(),
        });

        // cek apakah user sudah absen hari ini
        const existUser = await prisma.attendance.findFirst({
            where : { 
                studentId : user.id,
                date : {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)), // Mulai dari 00:00 hari ini
                    lt: new Date(new Date().setHours(23, 59, 59, 999)) // Sampai 23:59 hari ini
                }
            }
        })

        if(existUser) {
            return client.publish("/esp32/response", "Anda Sudah Absen")
        }

        const now = new Date();
        const batasTerlambat = new Date();
        batasTerlambat.setHours(7, 15, 0, 0);
    
        const statusAbsensi = now > batasTerlambat ? "Terlambat" : "Hadir";

        // Simpan absensi ke database
        await prisma.attendance.create({
            data: {
                student: {
                    connect: {
                        rfid: scannedRFID
                    }
                },
                date: new Date(),
                status : statusAbsensi
            }
        });

        client.publish("/esp32/response", "Absensi Berhasil")
    } else {
        client.publish("/esp32/response", "Tidak Terdaftar");
        console.log("Tidak terdaftar, response telah dikembalikan ke MQTT");
    }
});

client.on('error', (error) => {
    console.error('MQTT connection error:', error);
});

client.on('close', () => {
    console.log('MQTT connection closed');
});

client.on('offline', () => {
    console.log('MQTT client is offline');
});

export default client;