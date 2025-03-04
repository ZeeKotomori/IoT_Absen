import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const { SECRET_JWT } = process.env;
let tokenBlacklist = new Set();

export const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
    if (tokenBlacklist.has(token)) return res.status(401).json({ error: 'Token has been invalidated' });
    try {
        const decoded = jwt.verify(token, SECRET_JWT);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};