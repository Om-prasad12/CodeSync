import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;


export function verifyUser(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Login first' });
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
    console.error('Token verification error:', err);
  }
}

export default { verifyUser };