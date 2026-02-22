import express from "express";
import { protectRoute, checkRole } from "../middleware/auth.middleware.js";
import { uploadProfile } from "../middleware/upload.middleware.js";
import { 
    createAgent, 
    getAllAgents, 
    getAgentById, 
    updateAgent, 
    deleteAgent,
    getAgentProfile,
    updateAgentProfile,
    resetAgentPassword
} from "../controllers/agent.controller.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Profile route for the logged-in agent/admin/manager
router.get("/profile/me", checkRole(["agent", "admin", "manager"]), getAgentProfile);
router.put("/profile/me", checkRole(["agent"]), uploadProfile.single("profilePicture"), updateAgentProfile);

// Role-based routes
router.post("/", checkRole(["manager", "admin"]), uploadProfile.single("profilePicture"), createAgent);
router.get("/", getAllAgents);
router.get("/:id", getAgentById);
router.put("/:id", checkRole(["manager", "admin"]), uploadProfile.single("profilePicture"), updateAgent);
router.post("/:id/reset-password", checkRole(["manager", "admin"]), resetAgentPassword);
router.delete("/:id", checkRole(["manager", "admin"]), deleteAgent);

export default router;
