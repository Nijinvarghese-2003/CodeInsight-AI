import express from "express";
import {
  submitSolution,
  getMySubmissions,
  getAssignmentSubmissions,
  gradeSubmission,
} from "../controllers/submissionController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("student"), submitSolution);
router.get("/my", protect, authorize("student"), getMySubmissions);
router.get(
  "/assignment/:assignmentId",
  protect,
  authorize("faculty", "admin"),
  getAssignmentSubmissions
);
router.put(
  "/:id/grade",
  protect,
  authorize("faculty", "admin"),
  gradeSubmission
);

export default router;
