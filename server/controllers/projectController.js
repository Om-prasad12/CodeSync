import projectModel from "../models/projectModel.js";
import { getIO } from "../sockets/index.js";

// Create Project
export async function createProject(req, res) {
    try {
        const project = await projectModel.create({
            name: req.body.name,
            owner: req.userId,
        });

        res.status(201).json({
            message: "Project created successfully",
            data: project,
        });
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
}

// Get all projects of logged-in user
export async function getMyProjects(req, res) {
    try {
        const projects = await projectModel.find({
            $or: [
                { owner: req.userId },
                { collaborators: req.userId },
            ],
        })
        .populate("owner", "username email profilePicture")
        .populate("collaborators", "username email profilePicture");

        res.status(200).json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
}

// get project by id
export async function getProjectById(req, res) {
    try {
        const project = await projectModel.findById(req.params.projectId)
            .populate("owner", "username email profilePicture")
            .populate("collaborators", "username email profilePicture");

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
}

// Update project name (Owner only)
export async function updateProjectName(req, res) {
    try {
        const project = await projectModel.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        if (project.owner.toString() !== req.userId) {
            return res.status(403).json({
                message: "Only the owner can update the project",
            });
        }

        project.name = req.body.name;
        await project.save();

        res.status(200).json({
            message: "Project updated successfully",
            data: project,
        });
    } catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
}

// Add collaborator (Owner only)
export async function addCollaborator(req, res) {
    try {
        const project = await projectModel.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        if (project.owner.toString() !== req.userId) {
            return res.status(403).json({
                message: "Only the owner can add collaborators",
            });
        }

        if (project.collaborators.includes(req.collaboratorId)) {
            return res.status(400).json({
                message: "User is already a collaborator",
            });
        }

        project.collaborators.push(req.collaboratorId);
        await project.save();

        getIO().to(project._id.toString()).emit("collaborator:added", {
            projectId: project._id.toString(),
            collaboratorId: req.collaboratorId,
        });

        res.status(200).json({
            message: "Collaborator added successfully",
            data: project,
        });
    } catch (error) {
        console.error("Error adding collaborator:", error);
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
}

// Remove collaborator (Owner only)
export async function removeCollaborator(req, res) {
    try {
        const project = await projectModel.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        if (project.owner.toString() !== req.userId) {
            return res.status(403).json({
                message: "Only the owner can remove collaborators",
            });
        }

        const collaboratorExists = project.collaborators.some(
            (id) => id.toString() === req.collaboratorId.toString()
        );

        if (!collaboratorExists) {
            return res.status(404).json({
                message: "Collaborator not found in this project",
            });
        }

        project.collaborators = project.collaborators.filter(
            (id) => id.toString() !== req.collaboratorId.toString()
        );

        await project.save();

        getIO().to(project._id.toString()).emit("collaborator:removed", {
            projectId: project._id.toString(),
            collaboratorId: req.collaboratorId.toString(),
        });

        res.status(200).json({
            message: "Collaborator removed successfully",
            data: project,
        });
    } catch (error) {
        console.error("Error removing collaborator:", error);
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
}

// Delete project (Owner only)
export async function deleteProject(req, res) {
    try {
        const project = await projectModel.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        if (project.owner.toString() !== req.userId) {
            return res.status(403).json({
                message: "Only the owner can delete the project",
            });
        }

        await project.deleteOne();

        res.status(200).json({
            message: "Project deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
}