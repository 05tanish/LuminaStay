import { Router } from "express";

import {
  createInvite,
  validateInvite,
  registerWithInvite
} from "../Invitesystem/Invite.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";

const router = Router();

// Admin
router.post("/", authenticate, authorize("ADMIN"), createInvite);

// Public
router.get("/:code", validateInvite);
router.post("/register", registerWithInvite);

export default router;