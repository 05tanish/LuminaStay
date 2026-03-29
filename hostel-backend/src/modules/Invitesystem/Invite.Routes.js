import { Router } from "express";

import {
  createInvite,
  validateInvite,
  registerWithInvite
} from "../Invitesystem/Invite.controller.js";

import { protect } from "../../middleware/Authentification.Middleware.js";
import { authorize } from "../../middleware/authorization.Middleware.js";

const router = Router();

// Admin
router.post("/", protect, authorize("ADMIN"), createInvite);

// Public
router.get("/:code", validateInvite);
router.post("/register", registerWithInvite);

export default router;