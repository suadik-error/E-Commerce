import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
    getNotifications, 
    getUnreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
} from "../controllers/notification.controller.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Notification routes
router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/:id/read", markAsRead);
router.put("/read-all", markAllAsRead);
router.delete("/:id", deleteNotification);

export default router;
