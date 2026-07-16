import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;


export function verifyUser(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Login first' });
  try {
    const { id,username } = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = id;
    req.username = username;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
    console.error('Token verification error:', err);
  }
}

export async function attachUserInfo(req, res, next) {
    try {
        const user = await userModel.findById(req.userId).select(
            "username email profilePicture"
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        req.user = user;

        next();
    } catch (error) {
        console.error("Error attaching user info:", error);

        return res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
}

export default { verifyUser, attachUserInfo };