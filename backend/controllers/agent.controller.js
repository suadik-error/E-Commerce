import Agent from "../model/agent.model.js";
import Manager from "../model/manager.model.js";
import Notification from "../model/notification.model.js";
import User from "../model/user.model.js";
import { sendCredentialsEmail, sendCredentialsSms } from "../lib/credential-delivery.js";

const generateRandomPassword = (length = 12) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
    let password = "";
    for (let i = 0; i < length; i += 1) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

// Create a new agent (Manager only)
export const createAgent = async (req, res) => {
    try {
        const { name, email, phone, location, governmentId, dateOfBirth, address, profilePicture } = req.body;
        const uploadedProfilePicture = req.file?.path;
        const normalizedEmail = String(email || "").toLowerCase().trim();

        // Check if agent already exists
        const existingAgent = await Agent.findOne({ email: normalizedEmail });
        if (existingAgent) {
            return res.status(400).json({ message: "Agent with this email already exists" });
        }

        // Get the manager who is creating this agent
        const manager = await Manager.findOne({ email: req.user.email });
        if (!manager) {
            return res.status(404).json({ message: "Manager profile not found" });
        }

        let generatedPassword = "";
        let delivery = null;
        let user = await User.findOne({ email: normalizedEmail }).select("_id role");

        if (user && user.role !== "agent") {
            return res.status(400).json({ message: "A user with this email already exists with another role" });
        }

        if (!user) {
            generatedPassword = generateRandomPassword(12);
            user = await User.create({
                name: String(name || "").trim(),
                email: normalizedEmail,
                password: generatedPassword,
                role: "agent",
                profilePicture: uploadedProfilePicture || (profilePicture ? String(profilePicture).trim() : ""),
                createdByAdmin: manager.admin,
            });
        }

        let agent = null;
        try {
            // Create agent linked to manager
            agent = await Agent.create({
                name,
                email: normalizedEmail,
                phone,
                location,
                governmentId,
                dateOfBirth,
                address,
                profilePicture: uploadedProfilePicture || profilePicture,
                manager: manager._id
            });
        } catch (agentError) {
            if (generatedPassword && user?._id) {
                await User.findByIdAndDelete(user._id);
            }
            throw agentError;
        }

        if (generatedPassword) {
            const [emailDelivery, smsDelivery] = await Promise.all([
                sendCredentialsEmail({
                    toEmail: normalizedEmail,
                    name,
                    password: generatedPassword,
                }),
                sendCredentialsSms({
                    toPhone: phone,
                    name,
                    email: normalizedEmail,
                    password: generatedPassword,
                }),
            ]);
            delivery = { email: emailDelivery, sms: smsDelivery };
        }

        // Create notification for manager
        await Notification.create({
            recipient: req.user._id,
            recipientRole: "manager",
            type: "new_agent",
            title: "New Agent Created",
            message: `New agent ${name} has been created successfully`,
            reference: {
                model: "Agent",
                id: agent._id
            }
        });

        // Also notify admin
        const adminUser = await User.findById(manager.admin);
        if (adminUser) {
            await Notification.create({
                recipient: adminUser._id,
                recipientRole: "admin",
                type: "new_agent",
                title: "New Agent Created",
                message: `New agent ${name} has been created by manager ${manager.name}`,
                reference: {
                    model: "Agent",
                    id: agent._id
                }
            });
        }

        res.status(201).json({
            message: "Agent created successfully",
            agent,
            generatedPassword,
            delivery,
        });
    } catch (error) {
        console.error("Error creating agent:", error);
        res.status(500).json({ message: "Failed to create agent" });
    }
};

// Get all agents (Manager or Admin)
export const getAllAgents = async (req, res) => {
    try {
        let agents;
        
        if (req.user.role === "admin") {
            const managers = await Manager.find({ admin: req.user._id }).select("_id");
            const managerIds = managers.map((m) => m._id);
            agents = await Agent.find({ $or: [{ manager: { $in: managerIds } }, { manager: null }] })
                .populate("manager", "name email")
                .sort({ createdAt: -1 });
        } else if (req.user.role === "manager") {
            // Manager can see only their agents
            const manager = await Manager.findOne({ email: req.user.email });
            if (!manager) {
                return res.status(404).json({ message: "Manager profile not found" });
            }
            agents = await Agent.find({ manager: manager._id }).sort({ createdAt: -1 });
        } else {
            return res.status(403).json({ message: "Access denied" });
        }

        res.json(agents);
    } catch (error) {
        console.error("Error getting agents:", error);
        res.status(500).json({ message: "Failed to get agents" });
    }
};

// Get single agent by ID
export const getAgentById = async (req, res) => {
    try {
        let agent = null;

        if (req.user.role === "admin") {
            const managers = await Manager.find({ admin: req.user._id }).select("_id");
            const managerIds = managers.map((m) => m._id);
            agent = await Agent.findOne({
                _id: req.params.id,
                $or: [{ manager: { $in: managerIds } }, { manager: null }],
            })
                .populate("manager", "name email");
        } else if (req.user.role === "manager") {
            const manager = await Manager.findOne({ email: req.user.email });
            if (!manager) {
                return res.status(404).json({ message: "Manager profile not found" });
            }
            agent = await Agent.findOne({ _id: req.params.id, manager: manager._id })
                .populate("manager", "name email");
        } else if (req.user.role === "agent") {
            agent = await Agent.findOne({ _id: req.params.id, email: req.user.email })
                .populate("manager", "name email");
        }

        if (!agent) {
            return res.status(404).json({ message: "Agent not found" });
        }
        res.json(agent);
    } catch (error) {
        console.error("Error getting agent:", error);
        res.status(500).json({ message: "Failed to get agent" });
    }
};

// Update agent
export const updateAgent = async (req, res) => {
    try {
        const { name, phone, location, address, dateOfBirth, isActive, profilePicture, governmentId, managerId } = req.body;
        const uploadedProfilePicture = req.file?.path;
        let agent = null;

        if (req.user.role === "admin") {
            const managers = await Manager.find({ admin: req.user._id }).select("_id");
            const managerIds = managers.map((m) => m._id);

            const updates = {
                name,
                phone,
                location,
                address,
                dateOfBirth,
                isActive,
                profilePicture: uploadedProfilePicture || profilePicture,
                governmentId
            };

            if (managerId !== undefined) {
                if (managerId === null || managerId === "") {
                    updates.manager = null;
                } else {
                    const nextManager = await Manager.findOne({ _id: managerId, admin: req.user._id }).select("_id");
                    if (!nextManager) {
                        return res.status(404).json({ message: "Manager not found" });
                    }
                    updates.manager = nextManager._id;
                }
            }

            agent = await Agent.findOneAndUpdate(
                { _id: req.params.id, $or: [{ manager: { $in: managerIds } }, { manager: null }] },
                updates,
                { new: true }
            );
        } else if (req.user.role === "manager") {
            const manager = await Manager.findOne({ email: req.user.email });
            if (!manager) {
                return res.status(404).json({ message: "Manager profile not found" });
            }
            agent = await Agent.findOneAndUpdate(
                { _id: req.params.id, manager: manager._id },
                {
                    name,
                    phone,
                    location,
                    address,
                    dateOfBirth,
                    isActive,
                    profilePicture: uploadedProfilePicture || profilePicture,
                    governmentId
                },
                { new: true }
            );
        }

        if (!agent) {
            return res.status(404).json({ message: "Agent not found" });
        }

        if (agent?.email && (name || uploadedProfilePicture || profilePicture)) {
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
                await User.findOneAndUpdate({ email: agent.email, role: "agent" }, userUpdates);
            }
        }

        res.json({
            message: "Agent updated successfully",
            agent
        });
    } catch (error) {
        console.error("Error updating agent:", error);
        res.status(500).json({ message: "Failed to update agent" });
    }
};

// Delete agent (Manager or Admin)
export const deleteAgent = async (req, res) => {
    try {
        let agent = null;

        if (req.user.role === "admin") {
            const managers = await Manager.find({ admin: req.user._id }).select("_id");
            const managerIds = managers.map((m) => m._id);
            agent = await Agent.findOneAndDelete({
                _id: req.params.id,
                $or: [{ manager: { $in: managerIds } }, { manager: null }],
            });
        } else if (req.user.role === "manager") {
            const manager = await Manager.findOne({ email: req.user.email });
            if (!manager) {
                return res.status(404).json({ message: "Manager profile not found" });
            }
            agent = await Agent.findOneAndDelete({ _id: req.params.id, manager: manager._id });
        }

        if (!agent) {
            return res.status(404).json({ message: "Agent not found" });
        }

        await User.findOneAndDelete({ email: agent.email, role: "agent" });

        res.json({ message: "Agent deleted successfully" });
    } catch (error) {
        console.error("Error deleting agent:", error);
        res.status(500).json({ message: "Failed to delete agent" });
    }
};

// Get agent profile (Agent)
export const getAgentProfile = async (req, res) => {
    try {
        const agent = await Agent.findOne({ email: req.user.email });
        if (!agent) {
            return res.status(404).json({ message: "Agent profile not found" });
        }
        res.json(agent);
    } catch (error) {
        console.error("Error getting agent profile:", error);
        res.status(500).json({ message: "Failed to get agent profile" });
    }
};

// Update agent profile (Agent only)
export const updateAgentProfile = async (req, res) => {
    try {
        const { name, phone, location, address, profilePicture } = req.body;
        const uploadedProfilePicture = req.file?.path;

        const updates = {};
        if (typeof name === "string" && name.trim()) {
            updates.name = name.trim();
        }
        if (typeof phone === "string" && phone.trim()) {
            updates.phone = phone.trim();
        }
        if (typeof location === "string" && location.trim()) {
            updates.location = location.trim();
        }
        if (typeof address === "string") {
            updates.address = address.trim();
        }
        if (uploadedProfilePicture) {
            updates.profilePicture = uploadedProfilePicture;
        } else if (typeof profilePicture === "string") {
            updates.profilePicture = profilePicture.trim();
        }

        const agent = await Agent.findOneAndUpdate(
            { email: req.user.email },
            updates,
            { new: true, runValidators: true }
        );

        if (!agent) {
            return res.status(404).json({ message: "Agent profile not found" });
        }

        if (updates.name || typeof updates.profilePicture === "string") {
            const userUpdates = {
                ...(updates.name ? { name: updates.name } : {}),
                ...(typeof updates.profilePicture === "string" ? { profilePicture: updates.profilePicture } : {}),
            };
            await User.findOneAndUpdate({ _id: req.user._id }, userUpdates);
        }

        res.status(200).json(agent);
    } catch (error) {
        console.error("Error updating agent profile:", error);
        res.status(500).json({ message: "Failed to update profile" });
    }
};

// Update agent performance metrics
export const updateAgentPerformance = async (agentId, salesCount, revenue) => {
    try {
        await Agent.findByIdAndUpdate(agentId, {
            $inc: { totalSales: salesCount, totalRevenue: revenue }
        });
    } catch (error) {
        console.error("Error updating agent performance:", error);
    }
};

export const resetAgentPassword = async (req, res) => {
    try {
        let agent = null;

        if (req.user.role === "admin") {
            const managers = await Manager.find({ admin: req.user._id }).select("_id");
            const managerIds = managers.map((m) => m._id);
            agent = await Agent.findOne({
                _id: req.params.id,
                $or: [{ manager: { $in: managerIds } }, { manager: null }],
            });
        } else if (req.user.role === "manager") {
            const manager = await Manager.findOne({ email: req.user.email }).select("_id");
            if (!manager) {
                return res.status(404).json({ message: "Manager profile not found" });
            }
            agent = await Agent.findOne({ _id: req.params.id, manager: manager._id });
        } else {
            return res.status(403).json({ message: "Access denied" });
        }

        if (!agent) {
            return res.status(404).json({ message: "Agent not found" });
        }

        const user = await User.findOne({ email: agent.email, role: "agent" });
        if (!user) {
            return res.status(404).json({ message: "Agent user account not found" });
        }

        const generatedPassword = generateRandomPassword(12);
        user.password = generatedPassword;
        await user.save();

        const [emailDelivery, smsDelivery] = await Promise.all([
            sendCredentialsEmail({
                toEmail: user.email,
                name: user.name,
                password: generatedPassword,
            }),
            sendCredentialsSms({
                toPhone: agent.phone,
                name: user.name,
                email: user.email,
                password: generatedPassword,
            }),
        ]);

        res.status(200).json({
            message: "Temporary password generated successfully",
            generatedPassword,
            delivery: {
                email: emailDelivery,
                sms: smsDelivery,
            },
        });
    } catch (error) {
        console.error("Error resetting agent password:", error);
        res.status(500).json({ message: "Failed to reset agent password" });
    }
};
