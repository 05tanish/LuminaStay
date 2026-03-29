import { Router } from "express";

import {
  upsertMenu,
  getMenu,
  createWeeklyMenu,
  getWeeklyMenu
} from "../Food/Food.Controller.js";

import { protect } from "../../middleware/Authentification.Middleware.js";
import { authorize } from "../../middleware/authorization.Middleware.js";

const router = Router();

// DAILY
router.post("/menu", protect, authorize("ADMIN"), upsertMenu);
router.get("/menu", protect, getMenu);

// WEEKLY
router.post("/menu/weekly", protect, authorize("ADMIN"), createWeeklyMenu);
router.get("/menu/weekly", protect, getWeeklyMenu);

export default router;