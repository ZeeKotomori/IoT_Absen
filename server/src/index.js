import express from "express";
import client from "./service/mqttHandler.js"; 
import cookie from "cookie-parser"
import authRoute from "./routes/authRoute.js";
import teacherRoute from "./routes/teacherRoute.js";

const app = express();

app.use(cookie());
app.use(express.json());
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/teacher", teacherRoute);

app.listen(3000, () => {
    console.log('API running on http://localhost:3000');
});