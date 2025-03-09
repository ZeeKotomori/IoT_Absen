import { schedulePulling } from "../service/attendanceService.js";

export default async function pullAttendanceJob() {
    await schedulePulling();
}