import mqtt from 'mqtt';
import { absentStudentByRFID } from './studentTapAbsent.js';
import { logger } from '../../utils/logger.js';

const brokerUrl = 'mqtt://147.93.107.208:1883';
const topic = '/esp32/card/tap';

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
    logger.info("RFID : " + scannedRFID);

    const user = await absentStudentByRFID(scannedRFID);
    console.log(user);
    if (user) {
        logger.info(`${user.id} Ditemukan`);

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