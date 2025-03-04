import express from "express";
import { authenticateToken } from "../middleware/jwtmiddleware.js";
import { createTeacher, getTeachers } from "../controllers/teacherController.js";
import { checkUserRole } from "../middleware/roleCheck.js";

const teacherRoute = express.Router()

teacherRoute.get('/getTeachers', authenticateToken, getTeachers);
teacherRoute.post('/createTeacher', authenticateToken, checkUserRole(['STAFF_TU']),  createTeacher);

export default teacherRoute;