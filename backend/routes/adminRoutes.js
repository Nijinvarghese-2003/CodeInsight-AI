import express from "express";
import {
  getSystemStats,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  getPreApprovedUsers,
  addPreApprovedUser,
  deletePreApprovedUser,
  getPendingFaculties,
  approveFacultyWithLabs,
  rejectFaculty,
  updateFacultyLabs,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/stats", getSystemStats);
router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.put("/users/:id/status", toggleUserStatus);

// Pre-approved Directory Routes
router.get("/preapproved", getPreApprovedUsers);
router.post("/preapproved", addPreApprovedUser);
router.delete("/preapproved/:id", deletePreApprovedUser);

// Faculty Approvals & Lab Assignment Routes
router.get("/pending-faculties", getPendingFaculties);
router.put("/approve-faculty/:id", approveFacultyWithLabs);
router.delete("/reject-faculty/:id", rejectFaculty);
router.put("/faculty/:id/labs", updateFacultyLabs);

export default router;
