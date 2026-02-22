import Manager from "../model/manager.model.js";
import User from "../model/user.model.js";
import Notification from "../model/notification.model.js";
import Agent from "../model/agent.model.js";
import Worker from "../model/worker.model.js";

// Create a new manager (Admin only)
export const createManager = async (req, res) => {
    try {
        const { name, email, phone, address, governmentId, profilePicture } = req.body;
        const uploadedProfilePicture = req.file?.path;

        // Check if manager already exists
        const existingManager = await Manager.findOne({ email });
        if (existingManager) {
            return res.status(400).json({ message: "Manager with this email already exists" });
        }

        // Create manager linked to admin
        const manager = await Manager.create({
            name,
            email,
            phone,
            address,
            governmentId,
            profilePicture: uploadedProfilePicture || profilePicture,
            admin: req.user._id
        });

        // Create notification for admin
        await Notification.create({
            recipient: req.user._id,
            recipientRole: "admin",
            type: "new_manager",
            title: "New Manager Created",
            message: `New manager ${name} has been created successfully`,
            reference: {
                model: "Manager",
                id: manager._id
            }
        });

        res.status(201).json({
            message: "Manager created successfully",
            manager
        });
    } catch (error) {
        console.error("Error creating manager:", error);
        res.status(500).json({ message: "Failed to create manager" });
    }
};

// Get all managers (Admin only)
export const getAllManagers = async (req, res) => {
    try {
        const managers = await Manager.find({ admin: req.user._id }).sort({ createdAt: -1 });
        res.json(managers);
    } catch (error) {
        console.error("Error getting managers:", error);
        res.status(500).json({ message: "Failed to get managers" });
    }
};

// Get single manager by ID (Admin only)
export const getManagerById = async (req, res) => {
    try {
        const manager = await Manager.findOne({ _id: req.params.id, admin: req.user._id });
        if (!manager) {
            return res.status(404).json({ message: "Manager not found" });
        }
        res.json(manager);
    } catch (error) {
        console.error("Error getting manager:", error);
        res.status(500).json({ message: "Failed to get manager" });
    }
};

// Update manager (Admin only)
export const updateManager = async (req, res) => {
    try {
        const { name, phone, address, isActive, profilePicture, governmentId } = req.body;
        const uploadedProfilePicture = req.file?.path;

        const manager = await Manager.findOneAndUpdate(
            { _id: req.params.id, admin: req.user._id },
            {
                name,
                phone,
                address,
                isActive,
                profilePicture: uploadedProfilePicture || profilePicture,
                governmentId
            },
            { new: true }
        );

        if (!manager) {
            return res.status(404).json({ message: "Manager not found" });
        }

        const userUpdates = {};
        if (typeof name === "string" && name.trim()) {
            userUpdates.name = name.trim();
        }
        if (uploadedProfilePicture) {
            userUpdates.profilePicture = uploadedProfilePicture;
        } else if (typeof profilePicture === "string") {
            userUpdates.profilePicture = profilePicture.trim();
        }
        if (Object.keys(userUpdates).length > 0) {
            await User.findOneAndUpdate({ email: manager.email, role: "manager" }, userUpdates);
        }

        res.json({
            message: "Manager updated successfully",
            manager
        });
    } catch (error) {
        console.error("Error updating manager:", error);
        res.status(500).json({ message: "Failed to update manager" });
    }
};

// Delete manager (Admin only)
export const deleteManager = async (req, res) => {
    try {
        const manager = await Manager.findOne({ _id: req.params.id, admin: req.user._id });

        if (!manager) {
            return res.status(404).json({ message: "Manager not found" });
        }

        // Keep agents/workers, but unassign them so admin can reassign later.
        await Promise.all([
            Agent.updateMany({ manager: manager._id }, { $set: { manager: null } }),
            Worker.updateMany({ manager: manager._id }, { $set: { manager: null } }),
        ]);

        await Manager.deleteOne({ _id: manager._id });

        res.json({ message: "Manager deleted successfully" });
    } catch (error) {
        console.error("Error deleting manager:", error);
        res.status(500).json({ message: "Failed to delete manager" });
    }
};

// Get manager profile (Manager)
export const getManagerProfile = async (req, res) => {
    try {
        const manager = await Manager.findOne({ email: req.user.email });
        if (!manager) {
            return res.status(404).json({ message: "Manager profile not found" });
        }
        res.json(manager);
    } catch (error) {
        console.error("Error getting manager profile:", error);
        res.status(500).json({ message: "Failed to get manager profile" });
    }
};
