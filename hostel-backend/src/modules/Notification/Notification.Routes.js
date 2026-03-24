import express from "express";
import {
    broadcastNotification,
    sendUserNotification,
    getUserNotifications,
    markNotificationRead,
    getUnreadNotifications,
} from ".Notification.Controller.js"; // Assuming the controller file is named Notification.Controller.js, adjust if necessary

const router = express.Router();

// Route to broadcast a notification to all users
router.post('/broadcast', broadcastNotification);

// Route to send a notification to a specific user
router.post('/send', sendUserNotification);

// Route to get notifications for the authenticated user
router.get('/', getUserNotifications);

// Route to mark a specific notification as read
router.put('/:id/read', markNotificationRead);

// Route to get unread notifications for the authenticated user
router.get('/unread', getUnreadNotifications);

export default router;