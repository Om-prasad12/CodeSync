import userModel from "../models/userModel.js";

// Admin - Get all users
export async function getUser(req, res) {
    try {
        const users = await userModel.find({});

        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
}

// Admin - Get user by ID
export async function getUserId(req, res) {
    try {
        const user = await userModel.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
}

// Logged in user - Get own profile
export async function getMyProfile(req, res) {
    try {
        const user = await userModel.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
}

// Logged in user - Update profile
export async function updateMyProfile(req, res) {
    try {
        const updates = req.body;

        const allowedUpdates = [
            "username",
            "profilePicture",
        ];

        const isValidOperation = Object.keys(updates).every((key) =>
            allowedUpdates.includes(key)
        );

        if (!isValidOperation) {
            return res.status(400).json({
                message: "Invalid updates in request body",
            });
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            req.userId,
            { $set: updates },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
}

// Logged in user - Delete own account
export async function deleteMyProfile(req, res) {
    try {
        const user = await userModel.findByIdAndDelete(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json({
            message: "Account deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting profile:", error);
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
}