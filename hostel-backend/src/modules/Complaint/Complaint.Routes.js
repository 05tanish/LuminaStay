import express from "express";
import { createcomplaint, deletecomplaint, getcomplaint, updatecomplaint, updatecomplaintstatus } from "./Complaint.Controller.js";
import { protect } from "../../middleware/Authentification.Middleware.js";
import { authorize } from "../../middleware/authorization.Middleware.js";
const router = express.Router();

router.post("/create", protect, createcomplaint);
router.delete("/delete", protect, deletecomplaint);
router.get("/get", protect, getcomplaint);
router.put("/update", protect, updatecomplaint);
router.patch("/update/status", protect, authorize("ADMIN"), updatecomplaintstatus);

export default router;