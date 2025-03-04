import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

export const getTeachers = async (req, res) => {
    try {
        const teachers = await prisma.user.findMany({
            where : { role : "WALI_KELAS" },
            include : { classes: true }
        });

        if (!teachers || teachers.length === 0) {
            return res.status(404).send("Tidak Ada Data Guru");
        }

        const data = teachers.map( teacher => ({
                name : teacher.name, 
                email : teacher.email, 
                role : teacher.role,
                kelas : teacher.classes
            })
        )

        return res.status(200).send(data);
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }
}

export const createTeacher = async (req, res) => {
    const { name, email, password, kelasId } = req.body
    if (!name || !email || !password || !kelasId) return res.status(400).send({ message : "Isi semua data dengan lengkap" });

    try {
        const userExist = await prisma.user.findUnique({
            where : { email : email }
        });

        if (userExist) return res.status(400).send({ message : "Akun Sudah terdaftar" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name : name,
                email : email,
                password : hashedPassword,
                classes : {
                    connect : [
                        { id : kelasId }
                    ]
                }
            }
        });

        console.log(newUser);
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }
}