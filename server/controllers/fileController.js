import fileModel from "../models/fileModel.js";
import projectModel from "../models/projectModel.js";


// Delete folder recursively
async function deleteFolderRecursively(fileId) {
    const children = await fileModel.find({ parentId: fileId });

    for (const child of children) {
        if (child.type === "folder") {
            await deleteFolderRecursively(child._id);
        } else {
            await child.deleteOne();
        }
    }

    await fileModel.findByIdAndDelete(fileId);
}

// Create File/Folder
export async function createFile(req, res) {
    try {
        const {
            project,
            parentId,
            name,
            type,
            language
        } = req.body;

        
        let path = "";

        // Generate path
        if (parentId) {
            const parent = await fileModel.findById(parentId);

            if (!parent) {
                return res.status(404).json({
                    message: "Parent folder not found",
                });
            }

            if (parent.type !== "folder") {
                return res.status(400).json({
                    message: "Parent must be a folder",
                });
            }

            path = `${parent.path}/${name}`;
        } else {
            path = `/${name}`;
        }

        // Prevent duplicate names in the same folder
        const existing = await fileModel.findOne({
            project,
            parentId: parentId || null,
            name,
        });

        if (existing) {
            return res.status(400).json({
                message: "A file or folder with this name already exists.",
            });
        }

        const file = await fileModel.create({
            project,
            parentId: parentId || null,
            name,
            type,
            language: type === "file" ? (language || "plaintext") : "plaintext",
            path,
        });

        res.status(201).json({
            message: `${type} created successfully`,
            data: file,
        });

    } catch (error) {
        console.error("Error creating file:", error);
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
}

// Get all files of a project
export async function getProjectFiles(req, res) {
    try {
        const files = await fileModel.find({
            project: req.params.projectId,
        });

        res.status(200).json(files);

    } catch (error) {
        console.error("Error fetching files:", error);
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
}

// Get single file
export async function getFileById(req, res) {
    try {
        const file = await fileModel.findById(req.params.fileId);

        if (!file) {
            return res.status(404).json({
                message: "File not found",
            });
        }

        res.status(200).json(file);

    } catch (error) {
        console.error("Error fetching file:", error);
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
}

// Rename File/Folder
export async function renameFile(req, res) {
    try {
        const file = await fileModel.findById(req.params.fileId);

        if (!file) {
            return res.status(404).json({
                message: "File not found",
            });
        }

        file.name = req.body.name;

        await file.save();

        res.status(200).json({
            message: "Renamed successfully",
            data: file,
        });

    } catch (error) {
        console.error("Error renaming file:", error);
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
}

// Update file content
export async function updateFileContent(req, res) {
    try {
        const file = await fileModel.findById(req.params.fileId);

        if (!file) {
            return res.status(404).json({
                message: "File not found",
            });
        }

        if (file.type !== "file") {
            return res.status(400).json({
                message: "Folders don't have content",
            });
        }

        file.content = req.body.content;

        await file.save();

        res.status(200).json({
            message: "Content updated",
            data: file,
        });

    } catch (error) {
        console.error("Error updating content:", error);
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
}

// Delete file/folder
export async function deleteFile(req, res) {
    try {
        const file = await fileModel.findById(req.params.fileId);

        if (!file) {
            return res.status(404).json({
                message: "File not found",
            });
        }

        await fileModel.deleteMany({
            parentId: file._id,
        });

        await file.deleteOne();

        res.status(200).json({
            message: "Deleted successfully",
        });

    } catch (error) {
        console.error("Error deleting file:", error);
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
}