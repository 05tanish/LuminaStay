import express from "express";
import{ createcomplaint,deletecomplaint,getcomplaint,updatecomplaint,updatecomplaintstatus} from "./Complaint.Controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
const router = express.Router();

router.post("/create", authenticate, createcomplaint);
router.delete("/delete", authenticate, deletecomplaint);
router.get("/get", authenticate, getcomplaint);
router.put("/update", authenticate, updatecomplaint);
router.patch("/update/status", authenticate,authorize("ADMIN"), updatecomplaintstatus);

export default router;