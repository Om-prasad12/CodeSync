import express from "express";

import {
    getUser,
    getUserId,
    getMyProfile,
    updateMyProfile,
    deleteMyProfile,
} from "../controllers/userController.js";

import { verifyUser } from "../middleware/authmiddleware.js";

const userRouter = express.Router();

// Admin - Get all users
userRouter
.route("/")
.get(verifyUser,  getUser);

// Logged-in user - Get own profile
userRouter
.route("/me")
.get(verifyUser, getMyProfile)
.patch(verifyUser, updateMyProfile)
.delete(verifyUser, deleteMyProfile);

// Admin - Get any user by ID
userRouter
.route("/:id")
.get(verifyUser, getUserId);

export default userRouter;