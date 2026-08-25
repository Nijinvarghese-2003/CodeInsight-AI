import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  sendRegistrationOTP,
  resendRegistrationOTP,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send-otp", sendRegistrationOTP);
router.post("/resend-otp", resendRegistrationOTP);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);

export default router;
