import express from "express";
import {
    broadcastNotification,
    sendUserNotification,
    getUserNotifications,
    markNotificationRead,
    getUnreadNotifications,
} from ".Notification.Controller.js"; // Assuming the controller file is named Notification.Controller.js, adjust if necessary
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
const router = express.Router();
// admin
router.post("/broadcast", authenticate, authorize("ADMIN"), broadcastNotification);
router.post("/user", authenticate, authorize("ADMIN"), sendUserNotification);

// user
router.get("/", authenticate, getUserNotifications);
router.patch("/:id/read", authenticate, markNotificationRead);
// Route to get unread notifications for the authenticated user
router.get('/unread', authenticate, getUnreadNotifications);

export default router;