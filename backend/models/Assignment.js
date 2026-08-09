import mongoose from "mongoose";

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
