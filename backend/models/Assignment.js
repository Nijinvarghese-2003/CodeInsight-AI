import mongoose from "mongoose";
import "./Department.js";
import "./Course.js";
import "./LabSubject.js";
import "./User.js";

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    default: "",
  },
  expectedOutput: {
    type: String,
    required: [true, "Expected output is required"],
  },
  isHidden: {
    type: Boolean,
    default: false,
  },
});

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Assignment title is required"],
      trim: true,
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
    labSubject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LabSubject",
      default: null,
    },
    courseCode: {
      type: String,
      required: [true, "Course code is required"], // e.g., CS101, CS202
      trim: true,
    },
    courseName: {
      type: String,
      required: [true, "Course name is required"], // e.g., C Programming Lab, Java OOP Lab
      trim: true,
    },
    // Strictly locked language for this assignment/course
    requiredLanguage: {
      type: String,
      enum: ["c", "cpp", "java", "python", "javascript"],
      required: [true, "Required programming language is required"],
    },
    description: {
      type: String,
      required: [true, "Assignment description is required"],
    },
    instructions: {
      type: String,
      default: "",
    },
    testCases: [testCaseSchema],
    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
    },
    maxPoints: {
      type: Number,
      default: 100,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;
