import { Router } from "express";

import {
  createRoom,
  getRooms,
  assignBed,
  vacateBed
} from "../Rooms/Room.Controller.js";

import { protect } from "../../middleware/Authentification.Middleware.js";
import { authorize } from "../../middleware/authorization.Middleware.js";

const router = Router();

router.post("/", protect, authorize("Admin"), createRoom);
router.get("/", protect, getRooms);

router.post("/assign-bed", protect, authorize("Admin"), assignBed);
router.post("/vacate-bed", protect, authorize("Admin"), vacateBed);

export default router;