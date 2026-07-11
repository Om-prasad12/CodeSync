import userModel from "../models/userModel.js";

export async function getCollaboratorId(req, res, next) {
    try {
        const { email } = req.body;

        const collaborator = await userModel.findOne({ email });

        if (!collaborator) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        req.collaboratorId = collaborator._id;
        next();
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
}