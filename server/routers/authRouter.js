import express from "express";

import {
    userSignup,
    userLogin,
    userLogout,
    verifyEmail,
    checkLoginStatus
} from "../controllers/authController.js";
import { verifyUser,attachUserInfo } from "../middleware/authmiddleware.js";

const authRouter = express.Router();

authRouter
.route("/signup")
.post( userSignup);

authRouter
.route("/login")
.post(userLogin);

authRouter
.route("/logout")
.post(verifyUser,userLogout);

authRouter
.route("/isloggedin")
.get(verifyUser,attachUserInfo,checkLoginStatus);


export default authRouter;