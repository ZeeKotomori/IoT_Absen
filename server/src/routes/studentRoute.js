import express from "express";
import { getTotalStudentsOnCount } from "../controllers/studentController";
import { authenticateToken } from "../middleware/jwtmiddleware";
import { checkUserRole } from "../middleware/roleCheck";

const studentRoute = express.Router()

studentRoute.get('/getTotalStudentsOnCount', authenticateToken, checkUserRole("ADMIN","STAFF_TU"), getTotalStudentsOnCount);