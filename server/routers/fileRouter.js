import express from "express";

import {
    createFile,
    getProjectFiles,
    getFileById,
    renameFile,
    updateFileContent,
    deleteFile,
} from "../controllers/fileController.js";

import { verifyUser } from "../middleware/authmiddleware.js";
import { hasProjectAccess } from "../middleware/filemiddleware.js";

const fileRouter = express.Router();

// Create file/folder
fileRouter
    .route("/")
    .post(verifyUser,hasProjectAccess,createFile);

// Get all files of a project
fileRouter
    .route("/project/:projectId")
    .get(verifyUser,hasProjectAccess,getProjectFiles);

// Get, Rename and Delete a file/folder
fileRouter
    .route("/:fileId")
    .get(verifyUser,hasProjectAccess,getFileById)
    .put(verifyUser,hasProjectAccess,renameFile)
    .delete(verifyUser,hasProjectAccess,deleteFile
    );

// Update file content
fileRouter
    .route("/content/:fileId")
    .put(verifyUser,hasProjectAccess,updateFileContent);

export default fileRouter;