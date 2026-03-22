import { Router } from "express";

import { getMe } from "./User.Controller.js";
import {
  getUserNotifications,
  markNotificationRead
} from "../../controllers/user/Notification.Controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

/*
  All user routes require authentication
*/
router.use(authenticate);

/* ==============================
   USER PROFILE
============================== */

// get logged in user
router.get("/me", getMe);


/* ==============================
   USER NOTIFICATIONS
============================== */

// get all notifications
router.get("/notifications", getUserNotifications);

// mark notification as read
router.patch("/notifications/:id/read", markNotificationRead);

export default router;