import express from "express";
import {
  createDepartment,
  getDepartments,
  deleteDepartment,
  createCourse,
  getCourses,
  deleteCourse,
  createLabSubject,
  getLabSubjects,
  deleteLabSubject,
  getAcademicHierarchy,
} from "../controllers/academicController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public / Authenticated read routes
router.get("/departments", getDepartments);
router.get("/courses", getCourses);
router.get("/labs", getLabSubjects);
router.get("/hierarchy", getAcademicHierarchy);

// Admin-only management routes
router.post("/departments", protect, authorize("admin"), createDepartment);
router.delete("/departments/:id", protect, authorize("admin"), deleteDepartment);

router.post("/courses", protect, authorize("admin"), createCourse);
router.delete("/courses/:id", protect, authorize("admin"), deleteCourse);

router.post("/labs", protect, authorize("admin"), createLabSubject);
router.delete("/labs/:id", protect, authorize("admin"), deleteLabSubject);

export default router;
