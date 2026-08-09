import express from "express";
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
} from "../controllers/assignmentController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(protect, authorize("faculty", "admin"), createAssignment)
  .get(protect, getAssignments);

router
  .route("/:id")
  .get(protect, getAssignmentById)
  .put(protect, authorize("faculty", "admin"), updateAssignment)
  .delete(protect, authorize("faculty", "admin"), deleteAssignment);

export default router;
