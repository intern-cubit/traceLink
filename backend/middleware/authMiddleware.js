// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("Auth Header:", authHeader); // Debugging line
    console.log("JWT Secret:", process.env.JWT_SECRET); // Debugging line
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        console.log(token)
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            console.log(decoded) // contains user id, email, etc.
            next();
        } catch (error) {
            return res.status(401).json({ message: "Invalid Token" });
        }
    } else {
        return res.status(401).json({ message: "No Token Provided" });
    }
};

export default authMiddleware;
