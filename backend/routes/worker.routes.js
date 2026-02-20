import express from "express";
import { protectRoute, checkRole } from "../middleware/auth.middleware.js";
import { 
    createWorker, 
    getAllWorkers, 
    getWorkerById, 
    updateWorker, 
    deleteWorker 
} from "../controllers/worker.controller.js";

const router = express.Router();

// All routes require authentication and manager/admin role
router.use(protectRoute);
router.use(checkRole(["manager", "admin"]));

// Worker management routes
router.post("/", createWorker);
router.get("/", getAllWorkers);
router.get("/:id", getWorkerById);
router.put("/:id", updateWorker);
router.delete("/:id", deleteWorker);

export default router;
