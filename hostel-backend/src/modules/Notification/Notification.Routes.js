import express from "express";
import {
    broadcastNotification,
    sendUserNotification,
    getUserNotifications,
    markNotificationRead,
    getUnreadNotifications,
} from "../Notification/Notification.Controller.js"; // Assuming the controller file is named Notification.Controller.js, adjust if necessary
import { protect } from "../../middleware/Authentification.Middleware.js";
import { authorize } from "../../middleware/authorization.Middleware.js";
const router = express.Router();
// admin
router.post("/broadcast", protect, authorize("ADMIN"), broadcastNotification);
router.post("/user", protect, authorize("ADMIN"), sendUserNotification);

// user
router.get("/", protect, getUserNotifications);
router.patch("/:id/read", protect, markNotificationRead);
// Route to get unread notifications for the authenticated user
router.get('/unread', protect, getUnreadNotifications);

export default router;