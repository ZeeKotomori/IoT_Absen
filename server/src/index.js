import express from "express";
import { PrismaClient } from "@prisma/client";
import { absensiQueue } from "./queueWorker.js";
import "./mqttHandler.js";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("API Absensi IoT Running!");
});

app.get("/api/v1/absensi", async (req, res) => {
    const data = await prisma.absensi.findMany();
    res.json(data);
});

app.listen(3000, () => console.log("🚀 Backend running on port 3000"));
