import express from "express";
import { createAttendance, deleteAttendance, getAttendance, getAttendanceById, updateAttendance } from "../controllers/attendanceController.js";
import { checkUserRole } from "../middleware/roleCheck.js";
import { authenticateToken } from "../middleware/jwtmiddleware.js";

const routerAttendance = express.Router();

routerAttendance.get("/attendance", authenticateToken, getAttendance);
routerAttendance.get("/attendance/:id", authenticateToken, getAttendanceById);
routerAttendance.post("/attendance",  authenticateToken, checkUserRole("STAFF_TU", "WALI_KELAS"), createAttendance);
routerAttendance.patch("/attendance/:id", authenticateToken, checkUserRole("STAFF_TU", "WALI_KELAS"), updateAttendance);
routerAttendance.delete("/attendance/:id", authenticateToken, checkUserRole("STAFF_TU", "WALI_KELAS") ,deleteAttendance);

export default routerAttendance;