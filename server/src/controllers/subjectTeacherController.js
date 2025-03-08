import bcrypt from "bcryptjs";
import { getNextErrorIndex, logger } from "../utils/logger.js"; // Pastikan path benar
import prisma from "../../config/prisma.js";

export const getSubjectTeachers = async (req, res) => {
    try {
        const subjectTeachers = await prisma.user.findMany({
            where: { role: "GURU_MAPEL" },
            include: { 
                SubjectTeacher: {
                    select: { subjects: true }
                }
            }
        });

        if (!subjectTeachers || subjectTeachers.length === 0) {
            logger.warn("Tidak Ada Data Guru");
            return res.status(404).send("Tidak Ada Data Guru");
        }

        logger.info("Berhasil mengambil data guru");
        return res.status(200).send(subjectTeachers);
    } catch (error) {
        let errorId = getNextErrorIndex();
        logger.error({ message: `Error getSubjectTeachers: ${error.message}`, errorId });
        return res.status(500).send({ message: "Internal Server Error", errorId});
    }
};

export const createSubjectTeacher = async (req, res) => {
    const { name, email, password, confirmPassword, subject } = req.body;
    if (!name || !email || !password || !confirmPassword || !subject) {
        logger.warn("Data tidak lengkap saat registrasi guru");
        return res.status(400).send({ message: "Isi semua data dengan lengkap" });
    }

    try {
        if (password !== confirmPassword) {
            logger.warn("Password tidak cocok saat registrasi guru");
            return res.status(400).send({ message: "Password tidak Cocok" });
        }
        
        const userExist = await prisma.user.findUnique({ where: { email } });
        if (userExist) {
            logger.warn(`Akun dengan email ${email} sudah terdaftar`);
            return res.status(400).send({ message: "Akun Sudah terdaftar" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: { name, email, password: hashedPassword, role: "GURU_MAPEL" }
        });

        await prisma.subjectTeacher.create({
            data: {
                subjects: subject,
                teacher: { connect: { id: newUser.id } }
            }
        });

        logger.info(`Akun guru ${name} berhasil dibuat`);
        return res.status(201).send({ msg: "Akun guru berhasil dibuat" });
    } catch (error) {
        let errorId = getNextErrorIndex();
        logger.error({ message: `Error createSubjectTeacher: ${error.message}`, errorId });
        return res.status(500).send({ message: "Internal Server Error", errorId});
    }
};

export const updateSubjectTeacher = async (req, res) => {
    const { id } = req.params;
    const { name, password, confirmPassword, subject } = req.body;
    if (!name || !password || !confirmPassword || !subject) {
        logger.warn("Data tidak lengkap saat update guru");
        return res.status(400).send({ message: "Isi semua data dengan lengkap" });
    }

    try {
        if (password !== confirmPassword) {
            logger.warn("Password tidak cocok saat update guru");
            return res.status(400).send({ message: "Password tidak cocok" });
        }

        const user = await prisma.user.update({
            where: { id },
            data: { name, password: await bcrypt.hash(password, 10) }
        });

        if (!user) {
            logger.warn(`Akun dengan ID ${id} tidak ditemukan`);
            return res.status(404).send({ message: "Akun Tidak Ada" });
        }

        const subjectTeacher = await prisma.subjectTeacher.findFirst({ where: { teacherId: user.id } });
        if (!subjectTeacher) {
            logger.warn(`Data SubjectTeacher tidak ditemukan untuk ID ${id}`);
            return res.status(404).send({ message: "Data SubjectTeacher tidak ditemukan" });
        }

        await prisma.subjectTeacher.update({
            where: { id: subjectTeacher.id },
            data: { subjects: subject }
        });

        logger.info(`Akun guru ${name} berhasil diperbarui`);
        return res.status(201).send({ message: "Akun Guru Sudah Di Update", user });
    } catch (error) {
        let errorId = getNextErrorIndex();
        logger.error({ message: `Error updateSubjectTeacher: ${error.message}`, errorId });
        return res.status(500).send({ message: "Internal Server Error", errorId});
    }
};

export const deleteSubjectTeacher = async (req, res) => {
    const { id } = req.params;

    try {
        const existUser = await prisma.user.findUnique({ where: { id } });
        if (!existUser) {
            logger.warn(`Akun dengan ID ${id} tidak ditemukan saat penghapusan`);
            return res.status(404).send({ message: "Akun Tidak Ditemukan" });
        }

        await prisma.user.delete({ where: { id } });
        logger.info(`Akun guru dengan ID ${id} telah dihapus`);
        return res.status(200).send({ message: "Akun Sudah Dihapus" });
    } catch (error) {
        let errorId = getNextErrorIndex();
        logger.error({ message: `Error deleteSubjectTeacher: ${error.message}`, errorId });
        return res.status(500).send({ message: "Internal Server Error", errorId});
    }
};

export const getSubjectTeacherByName = async (req, res) => {
    const { name } = req.query;
    if (!name) {
        logger.warn("Nama tidak diisi saat mencari guru");
        return res.status(400).send({ message: "Isi semua data dengan lengkap" });
    }

    try {
        const user = await prisma.user.findFirst({
            where: { name: { contains: name, mode: "insensitive" } }
        });

        if (!user) {
            logger.warn(`Akun dengan nama ${name} tidak ditemukan`);
            return res.status(404).send({ message: "Akun tidak ditemukan" });
        }

        logger.info(`Akun guru ${name} ditemukan`);
        return res.status(200).send({ message: "Akun ditemukan", user });
    } catch (error) {
        let errorId = getNextErrorIndex();
        logger.error({ message: `Error getSubjectTeacherByName: ${error.message}`, errorId });
        return res.status(500).send({ message: "Internal Server Error", errorId});
    }
};
