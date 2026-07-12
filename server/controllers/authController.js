import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET;

export const userSignup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email and password are required."
            });
        }

        const userExists = await userModel.exists({ email });

        if (userExists) {
            return res.status(400).json({
                message: "User already exists."
            });
        }

        const user = await userModel.create({
            username,
            email,
            password,
        });

        // Generate JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Send cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(201).json({
            message: "Account created successfully.",
            token
        });

    } catch (err) {
        console.error("Error during user signup:", err);

        return res.status(500).json({
            message: err.message
        });
    }
};

export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const user = await userModel.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Uncomment when email verification is implemented
        /*
        if (!user.isVerified) {
            return res.status(401).json({
                message: "Please verify your email first."
            });
        }
        */

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Login successful.",
            token
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { userId, emailToken } = req.params;

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                message: "Email already verified."
            });
        }

        if (user.emailToken !== emailToken) {
            return res.status(400).json({
                message: "Invalid verification link."
            });
        }

        user.isVerified = true;
        user.emailToken = undefined;

        await user.save();

        return res.status(200).json({
            message: "Email verified successfully."
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

export const userLogout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    });

    return res.status(200).json({
        message: "Logout successful."
    });
};

export const checkLoginStatus = (req, res) => {
    return res.status(200).json({
        loggedIn: true,
        user: {
            id: req.user._id,
            username: req.user.username,
            profilePicture: req.user.profilePicture,
        }
    });
};