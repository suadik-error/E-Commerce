import express from "express";
import { protectRoute, checkRole } from "../middleware/auth.middleware.js";
import { uploadProfile } from "../middleware/upload.middleware.js";
import { 
    createManager, 
    getAllManagers, 
    getManagerById, 
    updateManager, 
    deleteManager,
    getManagerProfile 
} from "../controllers/manager.controller.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Admin routes for manager management
router.post("/users", checkRole(["admin"]), uploadProfile.single("profilePicture"), createManager);
router.post("/", checkRole(["admin"]), uploadProfile.single("profilePicture"), createManager);
router.get("/", checkRole(["admin"]), getAllManagers);
// Manager profile route (for manager/admin to get their own profile)
router.get("/profile/me", checkRole(["manager", "admin"]), getManagerProfile);
router.get("/:id", checkRole(["admin"]), getManagerById);
router.put("/:id", checkRole(["admin"]), uploadProfile.single("profilePicture"), updateManager);
router.delete("/:id", checkRole(["admin"]), deleteManager);

export default router;
