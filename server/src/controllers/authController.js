import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { logger, getNextErrorIndex } from "../utils/logger.js"
import prisma from "../../config/prisma.js";

const SECRET_JWT = process.env.SECRET_JWT;

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).send("Email dan Password harus di isi");

    try {
        const user = await prisma.user.findUnique({
            where: { email: email },
        });
        if (!user)
            return res
                .status(404)
                .send("Akun tidak ditemukan segera lakukan registrasi di Staff TU");

        const hashedPassword = await bcrypt.compare(password, user.password);
        if (!hashedPassword) return res.status(404).send("Password Salah");

        const token = jwt.sign(
            { email: user.email, role: user.role, name: user.name },
            SECRET_JWT
        );
        res.cookie("token", token, { httpOnly: true, maxAge: 60 * 60 * 1000 });

        return res.status(200).send({
            message: "Login Berhasil",
            token: token,
        });
    } catch (error) {
        let errorId = getNextErrorIndex();
        logger.error({
            message: `Error getSubjectTeacherByName: ${error.message}`,
            errorId,
        });
        return res.status(500).send({ message: "Internal Server Error", errorId });
    }
};

export const logout = async (req, res) => {
    res.clearCookie("token");
    res.status(200).send({ message: "logout berhasil" });
};
