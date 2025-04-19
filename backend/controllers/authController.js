// backend/controllers/authController.js
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const signup = async (req, res) => {
    const { username, fullName, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ $or : [{ email }, { username }] });
        if (!username || !fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (existingUser)
            return res.status(400).json({ message: "Email already in use" });

        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            fullName,
            email,
            passwordHash,
        });

        await user.save();
        return res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const login = async (req, res) => {
    const { identifier, password } = req.body;
    try {
        console.log(identifier, password)
        const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
        if (!identifier || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (!user)
            return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );
        res.json({ token, user: { id: user._id, fullName: user.fullName, username: user.username, email: user.email, trackers: user.trackers } });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};