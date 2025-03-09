import { markAbsent } from "../service/attendanceService.js";

export default async function markAbsentJob() {
    await markAbsent();
}