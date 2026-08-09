import mongoose from "mongoose";

const preApprovedUserSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["student", "faculty"],
      required: [true, "Role is required"],
    },
    officialId: {
      type: String,
      required: [true, "Official ID (Student ID / Faculty ID) is required"],
      trim: true,
      uppercase: true,
    },
    email: {
      type: String,
      required: [true, "Official Email is required"],
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    isRegistered: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness of (officialId, email, role)
preApprovedUserSchema.index({ officialId: 1, email: 1, role: 1 }, { unique: true });

const PreApprovedUser = mongoose.model("PreApprovedUser", preApprovedUserSchema);

export default PreApprovedUser;
