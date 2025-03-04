import express from "express";
import { login, logout } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/jwtmiddleware.js";

const authRoute = express.Router()

authRoute.post('/login', login);
authRoute.post('/logout', authenticateToken, logout);

export default authRoute;