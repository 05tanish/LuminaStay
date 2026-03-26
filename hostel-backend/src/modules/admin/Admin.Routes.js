import { Router } from "express";

import {
  addUser,
  deleteUser,
  updateRole,
  broadcastNotification,
  sendUserNotification
} from "./Admin.Controller.js";

import { authenticate } from "../../middlewares/Auth.Middleware.js";
import { authorize } from "../../middlewares/role.Middleware.js";

const router = Router();

/*
  All admin routes should pass through:
  1. Authentication
  2. Authorization (ADMIN only)
*/
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