import Notification from "../model/notification.model.js";

export const getNotifications = async (req, res) => {
    try {
        const recipientQuery = { recipient: req.user._id };

        const notifications = await Notification.find(recipientQuery)
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(notifications);
    } catch (error) {
        console.error("Error getting notifications:", error);
        res.status(500).json({ message: "Failed to get notifications" });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const recipientQuery = { recipient: req.user._id, isRead: false };

        const count = await Notification.countDocuments(recipientQuery);
        res.json({ count });
    } catch (error) {
        console.error("Error getting unread count:", error);
        res.status(500).json({ message: "Failed to get unread count" });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.json({
            message: "Notification marked as read",
            notification
        });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: "Failed to mark notification as read" });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        const recipientQuery = { recipient: req.user._id, isRead: false };

        await Notification.updateMany(recipientQuery, { isRead: true });

        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.json({ message: "Notification deleted successfully" });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ message: "Failed to delete notification" });
    }
};

export const createNotification = async (recipient, recipientRole, type, title, message, reference = null) => {
    try {
        const notification = await Notification.create({
            recipient,
            recipientRole,
            type,
            title,
            message,
            reference
        });
        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        return null;
    }
};
