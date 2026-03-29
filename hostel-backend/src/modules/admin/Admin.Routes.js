import { Router } from "express";

import {
   addUser,
   deleteUser,
   updateRole,
} from "../admin/Admin.Controller.js";

import { authenticate } from "../../middlewares/Authentification.Middleware.js";
import { authorize } from "../../middlewares/authorization.Middleware.js";

const router = Router();


router.use(authenticate);
router.use(authorize("ADMIN"));

/* ==============================
   USER MANAGEMENT
============================== */

// Create new user
router.post("/users", addUser);

// Delete user
router.delete("/users/:id", deleteUser);

// Update user role
router.patch("/users/:id/role", updateRole);


/* ==============================
   NOTIFICATION MANAGEMENT
============================== */

// Broadcast notification to all users
router.post("/notifications/broadcast", broadcastNotification);

// Send notification to specific user
router.post("/notifications/user", sendUserNotification);

export default router;