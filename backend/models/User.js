import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Common Fields
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      required: true,
    },

    phone: {
      type: String,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },

    // Student Fields
    studentId: {
      type: String,
      default: null,
    },

    rollNo: {
      type: String,
      default: null,
    },

    semester: {
      type: Number,
      default: null,
    },

    batch: {
      type: String,
      default: null,
    },

    // Common for Student & Faculty
    department: {
      type: String,
      default: null,
    },

    // Faculty Fields
    employeeId: {
      type: String,
      default: null,
    },

    designation: {
      type: String,
      default: null,
    },

    // Security
    lastLogin: {
      type: Date,
      default: null,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;