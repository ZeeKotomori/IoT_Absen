import express from "express";
import mqtt from "mqtt";
import { PrismaClient } from "@prisma/client";
import bycrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import client from "./service/mqttHandler.js"; 
import cookie from "cookie-parser"
import authRoute from "./routes/authRoute.js";

const app = express();
const prisma = new PrismaClient();

app.use(cookie());
app.use(express.json());
app.use("/api/v1/auth", authRoute);

app.listen(3000, () => {
    console.log('API running on http://localhost:3000');
});