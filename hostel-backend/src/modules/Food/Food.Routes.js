import { Router } from "express";

import {
  upsertMenu,
  getMenu,
  createWeeklyMenu,
  getWeeklyMenu
} from "..Food/Food.Controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";

const router = Router();

// DAILY
router.post("/menu", authenticate, authorize("ADMIN"), upsertMenu);
router.get("/menu", authenticate, getMenu);

// WEEKLY
router.post("/menu/weekly", authenticate, authorize("ADMIN"), createWeeklyMenu);
router.get("/menu/weekly", authenticate, getWeeklyMenu);

export default router;