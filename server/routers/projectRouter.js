import express from "express";

import {
    createProject,
    getMyProjects,
    getProjectById,
    updateProjectName,
    addCollaborator,
    removeCollaborator,
    deleteProject,
} from "../controllers/projectController.js";

import { verifyUser } from "../middleware/authmiddleware.js";
import { getCollaboratorId } from "../middleware/projectmiddleware.js";

const projectRouter = express.Router();

// Create project & Get all projects of logged-in user
projectRouter
.route("/")
.post(verifyUser, createProject)
.get(verifyUser, getMyProjects);

// Get project details
projectRouter
.route("/:projectId")
.get(verifyUser, getProjectById)
.patch(verifyUser, updateProjectName)
.delete(verifyUser, deleteProject);

// Add/remove collaborator
projectRouter
.route("/:projectId/collaborators")
.post(verifyUser, getCollaboratorId, addCollaborator)
.delete(verifyUser, getCollaboratorId, removeCollaborator);

export default projectRouter;