import express from "express";
import { authenticateToken } from "../middleware/jwtmiddleware.js";
import { createSubjectTeacher, deleteSubjectTeacher, getSubjectTeachers } from "../controllers/subjectTeacherController.js";
import { checkUserRole } from "../middleware/roleCheck.js";

const teacherRoute = express.Router()

teacherRoute.get('/getSubjectTeachers', authenticateToken, checkUserRole('GURU_MAPEL','STAFF_TU', 'ADMIN'), getSubjectTeachers);
teacherRoute.post('/createSubjectTeacher', authenticateToken, checkUserRole('STAFF_TU', 'ADMIN'), createSubjectTeacher);
teacherRoute.delete('/deleteSubjectTeacher/:id', authenticateToken, checkUserRole('STAFF_TU', 'ADMIN'), deleteSubjectTeacher);

export default teacherRoute;