import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

export const getSubjectTeachers = async (req, res) => {
    try {
        const subjectTeachers = await prisma.user.findMany({
            where : { role : "GURU_MAPEL" },
            include : { 
                SubjectTeacher : {
                    select : {
                        subjects : true
                    }
                }
            }
        });

        if (!subjectTeachers || subjectTeachers.length === 0) {
            return res.status(404).send("Tidak Ada Data Guru");
        }

        return res.status(200).send(subjectTeachers);
    } catch (error) {
        console.log(error);
        return res.status(500).send({message : "Internal Server Error" });
    }
}

export const createSubjectTeacher = async (req, res) => {
    const { name, email, password, confirmPassword, subject } = req.body
    if (!name || !email || !password || !confirmPassword || !subject) return res.status(400).send({ message : "Isi semua data dengan lengkap" });

    try {
        if(password !== confirmPassword) return res.status(400).send({ message: "Password tidak Cocok" });
        
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
                role : "GURU_MAPEL"
            }
        });

        await prisma.subjectTeacher.create({
            data: {
                subjects : subject,
                teacher : { 
                    connect : {
                        id : newUser.id
                    }
                }
            }
        })

        return res.status(201).send({ msg : "Akun guru berhasil di buat" });
    } catch (error) {
        console.log(error);
        return res.status(500).send({message : "Internal Server Error" });
    }
}

export const updateSubjectTeacher = async (req, res) => {
    const { id } = req.params;
    const { name, password, confirmPassword, subject } = req.body
    if (!name || !password || !confirmPassword || !subject) return res.status(400).send({ message : "Isi semua data dengan lengkap" });

    try {
        if (password !== confirmPassword) return res.status(400).send({ message : "Password tidak cocok" })
        
        const user = await prisma.user.update({
            where : {
                id : id
            },
            data : {
                name : name,
                password : password,
            }
        });
        
        if (!user) return res.status(404).send({ message : "Akun Tidak Ada" });

        const subjectTeacher = await prisma.subjectTeacher.findFirst({
            where: {
                teacherId: user.id
            }
        });

        if (!subjectTeacher) return res.status(404).send({ message: "Data SubjectTeacher tidak ditemukan" });
        
        await prisma.subjectTeacher.update({
            where: {
                id : subjectTeacher.id
            },
            data : {
                subjects : subject
            }
        });
        
        return res.status(201).send({ message : "Akun Guru Sudah Di Update", user });
    } catch (error) {
        console.log(error);
        return res.status(500).send({message : "Internal Server Error" });
    }
}

export const deleteSubjectTeacher = async (req, res) => {
    const { id } = req.params;

    try {
        const existUser = await prisma.subjectTeacher.findUnique({
            where : {
                id : id
            }
        })

        if (!existUser) return res.status(404).send({ message : "Akun Tidak Di temukan" });

        await prisma.subjectTeacher.delete({
            where : {
                id : id
            }
        });

        return res.status(200).send({ message : "Akun Sudah Dihapus" });
    } catch (error) {
        console.log(error);
        return res.status(500).send({message : "Internal Server Error" });
    }
}

export const getSubjectTeacherByName = async (req, res) => {
    const { name } = req.query;
    if (!name) return res.status(400).send({ message : "Isi semua data dengan lengkap" })

    try {
        const user = await prisma.user.findFirst({
            where : {
                name : { 
                    contains : name,
                    mode : "insensitive"
                }
            }
        });

        if (!user) return res.status(404).send({ message : "Akun tidak di temukan" });

        return res.status(200).send({ message : "Akun ditemukan", user });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message : "Internal Server Error" });
    }
}