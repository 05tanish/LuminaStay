import { Router } from "express";

import {
  createHostel,
  getHostels,
  getHostelById,
  updateHostel,
  deleteHostel
} from "../Hostel/Hostel.Controller.js";

import { protect } from "../../middleware/Authentification.Middleware.js";
import { authorize } from "../../middleware/authorization.Middleware.js";

const router = Router();

router.post("/", protect, authorize("ADMIN"), createHostel);
router.get("/", protect, getHostels);
router.get("/:id", protect, getHostelById);
router.put("/:id", protect, authorize("ADMIN"), updateHostel);
router.delete("/:id", protect, authorize("ADMIN"), deleteHostel);

export default router;