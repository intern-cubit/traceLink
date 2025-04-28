// backend/controllers/authController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendResetEmail } from "../utils/emailService.js";
import asyncHandler from "express-async-handler";

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

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const resetToken = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d",
        }
    );

    await sendResetEmail(email, resetToken);

    res.json({ message: "Password reset email sent (simulation)", resetToken });
});

export const resetPassword = asyncHandler(async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        console.log("Resetting password with token:", token);
        console.log("New password:", newPassword);

        if (!token) {
            res.status(400).json({ success: false, message: "Token is required" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            res.status(400).json({success:false, message:"Invalid or expired token"});
        }
        console.log("Decoded token:", decoded);

        const user = await User.findOne({ _id: decoded.id });
        console.log(user)
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        user.password = newPassword;
        await user.save();
        console.log("Password updated successfully for user:", user.username);
        res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.log("Error resetting password:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});