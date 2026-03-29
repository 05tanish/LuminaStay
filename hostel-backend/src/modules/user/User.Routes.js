import { Router } from "express";

import { getMe } from "./User.Controller.js";
import {
   getUserNotifications,
   markNotificationRead
} from "../Notification/Notification.Controller.js";

import { protect } from "../../middleware/Authentification.Middleware.js";

const router = Router();


router.use(protect);

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