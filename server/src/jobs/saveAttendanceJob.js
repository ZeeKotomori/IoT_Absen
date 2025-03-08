import { saveAbsentToDb } from "../service/attendanceService.js";

export default async function saveAttendanceJob() {
    await saveAbsentToDb();
}