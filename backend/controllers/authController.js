import bcrypt from "bcryptjs";
import User from "../models/User.js";
import PreApprovedUser from "../models/PreApprovedUser.js";
import generateToken from "../utils/generateToken.js";
import {
  sendEmailVerificationOtp,
  verifyEmailOtp,
} from "../services/twilioVerifyService.js";

// @desc    Validate registration details and send email verification OTP via Twilio
// @route   POST /api/auth/send-otp
// @access  Public
export const sendRegistrationOTP = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      course,
      studentId,
      rollNo,
      employeeId,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const validRoles = ["student", "faculty"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified for public registration",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists. Please log in instead.",
      });
    }

    // Student verification against PreApprovedUser list
    if (role === "student") {
      const studentIdToVerify = (studentId || rollNo || "").trim().toUpperCase();
      if (!department || !course || (!rollNo && !studentId)) {
        return res.status(400).json({
          success: false,
          message: "Please select Department, Course, and enter Student ID / Roll Number",
        });
      }

      const preApprovedRecord = await PreApprovedUser.findOne({
        role: "student",
        email: normalizedEmail,
        officialId: studentIdToVerify,
      });

      if (!preApprovedRecord) {
        return res.status(400).json({
          success: false,
          message:
            "Pre-verification failed: Student ID and Official Email combination not found in pre-approved records. Contact Administrator.",
        });
      }

      if (preApprovedRecord.isRegistered) {
        return res.status(400).json({
          success: false,
          message: "This student record has already been registered.",
        });
      }
    }

    // Faculty verification against PreApprovedUser list
    if (role === "faculty") {
      const facultyIdToVerify = (employeeId || "").trim().toUpperCase();
      if (!department || !facultyIdToVerify) {
        return res.status(400).json({
          success: false,
          message: "Please select Department and enter Faculty / Employee ID",
        });
      }

      const preApprovedRecord = await PreApprovedUser.findOne({
        role: "faculty",
        email: normalizedEmail,
        officialId: facultyIdToVerify,
      });

      if (!preApprovedRecord) {
        return res.status(400).json({
          success: false,
          message:
            "Pre-verification failed: Faculty ID and Official Email combination not found in pre-approved records. Contact Administrator.",
        });
      }

      if (preApprovedRecord.isRegistered) {
        return res.status(400).json({
          success: false,
          message: "This faculty record has already been registered.",
        });
      }
    }

    // Send OTP via Twilio Verify
    const otpResult = await sendEmailVerificationOtp(normalizedEmail);

    return res.status(200).json({
      success: true,
      message: `Verification code sent to ${normalizedEmail}`,
      isDevMode: otpResult.isDevMode || false,
      devCode: otpResult.devCode || null,
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send verification code. Please try again.",
    });
  }
};

// @desc    Resend email verification OTP via Twilio
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendRegistrationOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required to resend verification code",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otpResult = await sendEmailVerificationOtp(normalizedEmail);

    return res.status(200).json({
      success: true,
      message: `New verification code sent to ${normalizedEmail}`,
      isDevMode: otpResult.isDevMode || false,
      devCode: otpResult.devCode || null,
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to resend verification code",
    });
  }
};

// @desc    Register a new user after Twilio Email OTP verification
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      verificationCode,

      department,
      course,

      studentId,
      rollNo,
      semester,
      batch,

      employeeId,
      designation,
      teachingLabs,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    if (!verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Please enter the 6-digit email verification code sent to your email",
      });
    }

    const validRoles = ["student", "faculty"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified for public registration",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    let isApproved = true;
    let initialStatus = "active";
    let preApprovedRecord = null;

    // Student verification against PreApprovedUser list
    if (role === "student") {
      const studentIdToVerify = (studentId || rollNo || "").trim().toUpperCase();
      if (!department || !course || (!rollNo && !studentId)) {
        return res.status(400).json({
          success: false,
          message: "Please select Department, Course, and enter Student ID / Roll Number",
        });
      }

      preApprovedRecord = await PreApprovedUser.findOne({
        role: "student",
        email: normalizedEmail,
        officialId: studentIdToVerify,
      });

      if (!preApprovedRecord) {
        return res.status(400).json({
          success: false,
          message:
            "Pre-verification failed: Student ID and Official Email combination not found in pre-approved list. Contact Administrator.",
        });
      }
    }

    // Faculty verification against PreApprovedUser list
    if (role === "faculty") {
      const facultyIdToVerify = (employeeId || "").trim().toUpperCase();
      if (!department || !facultyIdToVerify) {
        return res.status(400).json({
          success: false,
          message: "Please select Department and enter Faculty / Employee ID",
        });
      }

      preApprovedRecord = await PreApprovedUser.findOne({
        role: "faculty",
        email: normalizedEmail,
        officialId: facultyIdToVerify,
      });

      if (!preApprovedRecord) {
        return res.status(400).json({
          success: false,
          message:
            "Pre-verification failed: Faculty ID and Official Email combination not found in pre-approved list. Contact Administrator.",
        });
      }

      // Faculty requires Admin approval and assignment of lab subjects
      isApproved = false;
      initialStatus = "pending";
    }

    // Verify OTP using Twilio Verify
    const verifyResult = await verifyEmailOtp(normalizedEmail, verificationCode);
    if (!verifyResult.success) {
      return res.status(400).json({
        success: false,
        message: verifyResult.message || "Invalid or expired verification code",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      phone: phone || "",

      department: department || null,
      course: course || null,

      studentId: studentId || rollNo || null,
      rollNo: rollNo || studentId || null,
      semester: semester || null,
      batch: batch || null,

      employeeId: employeeId ? employeeId.trim().toUpperCase() : null,
      designation: designation || null,
      teachingLabs: role === "faculty" ? [] : teachingLabs || [],

      status: initialStatus,
      isApproved,
      isVerified: true,
    });

    if (preApprovedRecord) {
      preApprovedRecord.isRegistered = true;
      await preApprovedRecord.save();
    }

    // If faculty is pending approval, return pending status message without token
    if (role === "faculty" && initialStatus === "pending") {
      return res.status(201).json({
        success: true,
        pendingApproval: true,
        message:
          "Email verified and registration details submitted successfully! Your account is now pending Admin approval and lab subject assignment.",
      });
    }

    const populatedUser = await User.findById(user._id)
      .select("-password")
      .populate("department", "name code")
      .populate("course", "name code")
      .populate("teachingLabs", "name code requiredLanguage");

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      message: "Registration Successful! Email verified.",
      token,
      user: populatedUser,
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select("+password")
      .populate("department", "name code")
      .populate("course", "name code")
      .populate("teachingLabs", "name code requiredLanguage");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.status === "pending" || !user.isApproved) {
      return res.status(403).json({
        success: false,
        message:
          "Your registration request is pending Admin approval and lab subject assignment. Please wait for Admin approval.",
      });
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account is blocked by the administrator",
      });
    }

    const token = generateToken(user._id, user.role);
    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      token,
      user: userObj,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("department", "name code")
      .populate("course", "name code")
      .populate("teachingLabs", "name code requiredLanguage");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};