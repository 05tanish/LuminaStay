import { Router } from "express";

import {
  createHostel,
  assignAdmin
} from "../SuperAdmin/Superadmin.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeHostelRole } from "../../middlewares/hostelRole.middleware.js";

const router = Router();

// SUPER ADMIN → create hostel
router.post("/", authenticate, createHostel);

// SUPER ADMIN → assign admin
router.post(
  "/assign-admin",
  authenticate,
  authorizeHostelRole("SUPER_ADMIN"),
  assignAdmin
);

export default router;