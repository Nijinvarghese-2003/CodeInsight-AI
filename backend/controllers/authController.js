import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,

      studentId,
      rollNo,
      semester,
      batch,

      department,

      employeeId,
      designation,
    } = req.body;

    // Check required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Validate role
    const validRoles = ["student", "faculty"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Check email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Student validation
    if (role === "student") {
      if (!studentId || !semester || !batch || !department) {
        return res.status(400).json({
          success: false,
          message: "Student details are incomplete",
        });
      }
    }

    // Faculty validation
    if (role === "faculty") {
      if (!employeeId || !designation || !department) {
        return res.status(400).json({
          success: false,
          message: "Faculty details are incomplete",
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,

      studentId,
      rollNo,
      semester,
      batch,

      department,

      employeeId,
      designation,
    });

    // Generate token
    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      message: "Registration Successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};