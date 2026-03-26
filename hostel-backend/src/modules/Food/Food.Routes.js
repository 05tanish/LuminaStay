import { Router } from "express";

import {
  upsertMenu,
  getMenu,
  createWeeklyMenu
} from "..Food/Food.Controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";

const router = Router();

// DAILY
router.post("/menu", authenticate, authorize("ADMIN"), upsertMenu);
router.get("/menu", authenticate, getMenu);

// WEEKLY
router.post("/menu/weekly", authenticate, authorize("ADMIN"), createWeeklyMenu);

export default router;