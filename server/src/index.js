import express from "express";
import client from "./service/mqtt/mqttHandler.js";
import cookie from "cookie-parser";
import authRoute from "./routes/authRoute.js";
import subjectTeacherRoute from "./routes/subjectTeacherRoute.js";
import routerAttendance from "./routes/attendanceRoute.js";
import { scheduleJobs } from "./service/queueService.js";

const app = express();

app.use(express.json());
app.use(cookie());

app.use("/api/v1/", routerAttendance);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/teacher", subjectTeacherRoute);

app.listen(3000, () => {
    console.log("API running on http://localhost:3000");
    scheduleJobs();
});
