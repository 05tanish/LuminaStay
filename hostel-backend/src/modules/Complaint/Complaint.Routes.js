import express from "express";
import {
  createcomplaint,
  deletecomplaint,
  getcomplaint,
  updatecomplaint,
  updatecomplaintstatus,
  getAdminComplaints,
  getSuperAdminComplaints,
  addComplaintComment,
  getComplaintComments
} from "./Complaint.Controller.js";
import { protect } from "../../middleware/Authentification.Middleware.js";
import { authorize } from "../../middleware/authorization.Middleware.js";
import { validate } from "../../middleware/Validate.Middleware.js";
import {
  createComplaintSchema,
  updateComplaintSchema,
  updateComplaintStatusSchema,
  addCommentSchema
} from "./Complaint.Schema.js";

const router = express.Router();

// ─── STATIC ROUTES FIRST (must come before /:complaintID) ────────────────────

// User: create complaint
router.post("/", protect, validate(createComplaintSchema), createcomplaint);

// User: get own complaints
router.get("/", protect, getcomplaint);

// Admin/SuperAdmin: update status (PATCH /status must be before /:complaintID)
router.patch("/status", protect, authorize("ADMIN", "SUPER_ADMIN"), validate(updateComplaintStatusSchema), updatecomplaintstatus);

// Admin: get hostel complaints
router.get("/admin", protect, authorize("ADMIN"), getAdminComplaints);

// SuperAdmin: get all complaints
router.get("/superadmin", protect, authorize("SUPER_ADMIN"), getSuperAdminComplaints);

// ─── DYNAMIC ROUTES (/:complaintID must come AFTER all static routes) ─────────

// User: update own complaint
router.put("/:complaintID", protect, validate(updateComplaintSchema), updatecomplaint);

// User/Admin: delete complaint
router.delete("/:complaintID", protect, deletecomplaint);

// Comments
router.post("/:complaintID/comments", protect, validate(addCommentSchema), addComplaintComment);
router.get("/:complaintID/comments", protect, getComplaintComments);

export default router;
