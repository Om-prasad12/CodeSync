import express from "express";

import {
    userSignup,
    userLogin,
    userLogout,
    verifyEmail,
    checkLoginStatus
} from "../controllers/authController.js";
import { verifyUser } from "../middleware/authmiddleware.js";

const authRouter = express.Router();

authRouter
.route("/signup")
.post( userSignup);

authRouter
.route("/login")
.post(userLogin);

authRouter
.route("/logout")
.get(userLogout);

authRouter
.route("/isloggedin")
.get(verifyUser,checkLoginStatus);


export default authRouter;