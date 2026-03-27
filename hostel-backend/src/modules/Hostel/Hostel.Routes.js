import { Router } from "express";

import {
  createHostel,
  getHostels,
  getHostelById,
  updateHostel,
  deleteHostel
} from "../Hostel/Hostel.Controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";

const router = Router();

router.post("/", authenticate, authorize("ADMIN"), createHostel);
router.get("/", authenticate, getHostels);
router.get("/:id", authenticate, getHostelById);
router.put("/:id", authenticate, authorize("ADMIN"), updateHostel);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteHostel);

export default router;