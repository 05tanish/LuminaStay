import { Router } from "express";

import {
  createHostel,
  assignAdmin
} from "../SuperAdmin/Superadmin.controller.js";

import { protect } from "../../middleware/Authentification.Middleware.js";
import { authorize } from "../../middleware/authorization.Middleware.js";

const router = Router();

// SUPER ADMIN → create hostel
router.post("/", protect, authorize("SuperAdmin"), createHostel);

// SUPER ADMIN → assign admin
router.post(
  "/assign-admin",
  protect,
  authorizeHostelRole("SUPER_ADMIN"),
  assignAdmin
);

export default router;