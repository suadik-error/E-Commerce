import express from "express";
import { createInternalMessage, getInternalMessages } from "../controllers/message.controller.js";
import { checkRole, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, checkRole(["admin", "manager", "agent"]), getInternalMessages);
router.post("/", protectRoute, checkRole(["admin", "manager", "agent"]), createInternalMessage);

export default router;
