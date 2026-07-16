import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";

import connectDB from "./db/db.js";
import { initSocket } from "./sockets/index.js";

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

// Wrap Express app in an HTTP server so socket.io can attach to it
const server = http.createServer(app);
initSocket(server);

// Start server
const startServer = async () => {
    try {
        await connectDB();

        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message);
        process.exit(1);
    }
};

startServer();