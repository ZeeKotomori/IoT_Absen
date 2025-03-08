import prisma from "../../config/prisma";
import { logger } from "../utils/logger";

export const getAttendance = async (req, res) => {
    try {
        const attendance = await prisma.attendance.findMany();

        if (!attendance) return res.status(404).send({ message : "Data tidak ditemukan" });

        return res.status(200).send({ message : "Data ditemukan", attendance});
    } catch (error) {
        let errorId = getNextErrorIndex();
        logger.error({ message: `Error getAttendanceById: ${error.message}`, errorId });
        return res.status(500).send({ message: "Internal Server Error", errorId});
    }
};

export const getAttendanceById = async (req, res) => {
    const { id } = req.params;

    try {
        const today = new Date().toISOString().split("T")[0];

        const attendance = await prisma.attendance.findFirst({
            where: { id: id, date: today }
        });

        if (!attendance) return res.status(404).send({ message : "Data tidak ditemukan" });

        return res.status(200).send({ userId: id, status: attendance?.status || "BELUM_HADIR" });
    } catch (error) {
        let errorId = getNextErrorIndex();
        logger.error({ message: `Error getAttendanceById: ${error.message}`, errorId });
        return res.status(500).send({ message: "Internal Server Error", errorId});
    }
};

export const createAttendance = async (req, res) => {
    try {
        const { studentId, status } = req.body;
        const today = new Date().toISOString().split("T")[0];

        const timeNow = new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });

        const newAttendance = await prisma.attendance.create({
            data: {
                studentId,
                status,
                date: today,
                time_in: timeNow
            }
        });

        return res.status(201).send({ message: "Data kehadiran ditambahkan", attendance: newAttendance });
    } catch (error) {
        logger.error(`Error createAttendance: ${error.message}`);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

export const updateAttendance = async (req, res) => {
    const { id } = req.params;
    const { status, time_in } = req.body;

    try {
        const attendance = await prisma.attendance.update({
            where: { id: id },
            data: { status, time_in }
        });

        return res.status(200).send({ message: "Data kehadiran diperbarui", attendance });
    } catch (error) {
        logger.error(`Error updateAttendance: ${error.message}`);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

export const deleteAttendance = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.attendance.delete({
            where: { id: id }
        });

        return res.status(200).send({ message: "Data kehadiran dihapus" });
    } catch (error) {
        logger.error(`Error deleteAttendance: ${error.message}`);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};