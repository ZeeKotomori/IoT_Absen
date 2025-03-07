import express from "express";
import client from "./service/mqttHandler.js";
import cookie from "cookie-parser";
import authRoute from "./routes/authRoute.js";
import subjectTeacherRoute from "./routes/subjectTeacherRoute.js";
import morgan from "morgan";
import winston from "winston";
import fs from "fs";
import path from "path";

const app = express();

const logDirectory = path.join(process.cwd(), "logs");
const errorIndexFile = path.join(logDirectory, "error_index.txt");

if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

// Fungsi untuk mendapatkan error index terakhir
const getNextErrorIndex = () => {
    if (!fs.existsSync(errorIndexFile)) {
        fs.writeFileSync(errorIndexFile, "0", "utf8"); // Jika belum ada, buat dengan angka 0
    }

    let currentIndex = parseInt(fs.readFileSync(errorIndexFile, "utf8"), 10);
    let nextIndex = currentIndex + 1;
    fs.writeFileSync(errorIndexFile, nextIndex.toString(), "utf8"); // Update index di file

    return nextIndex;
};

const logger = winston.createLogger({
    level: "error",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ 
            filename: path.join(logDirectory, "error.log"),
            level: "error"
        }),
        new winston.transports.Console(),
    ],
});

app.use(express.json());
app.use(cookie());
app.use(morgan("combined"));

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/teacher", subjectTeacherRoute);

// Route yang memicu error
app.get("/error", (req, res) => {
    throw new Error("Simulasi error di Express.js!");
});

// Middleware untuk menangani error (HARUS DI LETAKKAN PALING AKHIR)
app.use((err, req, res, next) => {
    const errorId = getNextErrorIndex(); // Ambil nomor error berikutnya

    logger.error({
        errorId: errorId,
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString(),
    });

    res.status(500).json({
        status: "error",
        errorId: errorId, // Kirim ID error ke response
        message: "Terjadi kesalahan pada server",
    });
});

app.listen(3000, () => {
    console.log("API running on http://localhost:3000");
});
