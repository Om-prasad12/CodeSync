import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./db/db.js";

import userRouter from "./routers/userRouter.js";
import authRouter from "./routers/authRouter.js";
import projectRouter from "./routers/projectRouter.js";
import fileRouter from "./routers/fileRouter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/project", projectRouter);
app.use("/file", fileRouter);


app.get("/", (req, res) => {
    res.send("Server is running 🚀");
});

// 404 handler
app.use((req, res) => {
    res.status(404).send("404 Page not found");
});

// Start server
const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

    } catch (error) {

        console.error("Failed to connect to MongoDB:", error.message);
        process.exit(1);

    }
};

startServer();