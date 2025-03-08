import winston from "winston";
import fs from "fs";
import path from "path";

const logDirectory = path.join(process.cwd(), "logs");
const errorIndexFile = path.join(logDirectory, "error_index.txt");

if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

export const getNextErrorIndex = () => {
    try {
        if (!fs.existsSync(errorIndexFile)) {
            fs.writeFileSync(errorIndexFile, "0", "utf8");
        }

        let currentIndex = parseInt(fs.readFileSync(errorIndexFile, "utf8") || "0", 10);
        let nextIndex = currentIndex + 1;

        fs.writeFileSync(errorIndexFile, nextIndex.toString(), "utf8");
        return nextIndex;
    } catch (error) {
        console.error("Gagal memperbarui error index:", error);
        return -1;
    }
}; 

export const logger = winston.createLogger({
    level: "error",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, errorId }) => {
            return `${timestamp} [${level.toUpperCase()}] (Error ID: ${errorId || "N/A"}): ${message}`;
        })
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(logDirectory, "error.log"),
            level: "error"
        }),
        new winston.transports.File({
            filename: path.join(logDirectory, "warn.log"),
            level: "warn"
        }),
        new winston.transports.File({
            filename: path.join(logDirectory, "info.log"),
            level: "info"
        }),
        new winston.transports.Console(),
    ]
});
