import fileModel from "../models/fileModel.js";
import projectModel from "../models/projectModel.js";

export async function hasProjectAccess(req, res, next) {
    try {
        let projectId = req.body?.projectId || req.params.projectId;

        // console.log("userId:", req.userId);
        // console.log("body:", req.body);
        // console.log("params:", req.params);
        // console.log("projectId:", projectId);
        // For routes that only have a fileId
        if (!projectId && req.params.fileId) {
            const file = await fileModel.findById(req.params.fileId);

            if (!file) {
                return res.status(404).json({
                    message: "File not found",
                });
            }

            projectId = file.project;
            req.file = file; // Reuse in controller
        }

        const project = await projectModel.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const hasAccess =
            project.owner.toString() === req.userId ||
            project.collaborators.some(
                id => id.toString() === req.userId
            );

        if (!hasAccess) {
            return res.status(403).json({
                message: "Access denied",
            });
        }

        req.project = project;

        next();

    } catch (error) {
        console.error("Error checking project access:", error);
        res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
}