import mqtt from 'mqtt';
import { absensiQueue } from './queueWorker.js';

const client = mqtt.connect("mqtt://localhost:1883");

client.on("connect", () => {
    console.log("MQTT Connected!");
    client.subscribe("iot/absensi", (err) => {
        if (err) {
            console.error(err);
        }
    });
});

client.on("message", async (topic, message) => {
    if (topic === "iot/absensi") {
        const data = JSON.parse(message.toString());
        console.log("🤖 Data masuk antrian", data);

        await absensiQueue.add("tapping", data);
    }
});