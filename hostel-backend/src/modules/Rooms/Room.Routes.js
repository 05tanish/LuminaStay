    import { Router } from "express";

import {
  createRoom,
  getRooms,
  assignBed,
  vacateBed
} from "../Rooms/Room.Controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";

const router = Router();

router.post("/", authenticate, authorize("ADMIN"), createRoom);
router.get("/", authenticate, getRooms);

router.post("/assign-bed", authenticate, authorize("ADMIN"), assignBed);
router.post("/vacate-bed", authenticate, authorize("ADMIN"), vacateBed);

export default router;