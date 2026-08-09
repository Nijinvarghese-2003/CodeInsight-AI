import mongoose from "mongoose";

const testCaseResultSchema = new mongoose.Schema({
  testCaseId: String,
  input: String,
  expectedOutput: String,
  actualOutput: String,
  passed: Boolean,
  executionTime: Number,
  memory: Number,
  error: String,
});

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    submittedLanguage: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: [true, "Submitted code cannot be empty"],
    },
    status: {
      type: String,
      enum: ["Accepted", "Wrong Answer", "Compile Error", "Runtime Error", "Pending"],
      default: "Pending",
    },
    score: {
      type: Number,
      default: 0,
    },
    passedCount: {
      type: Number,
      default: 0,
    },
    totalCount: {
      type: Number,
      default: 0,
    },
    testCaseResults: [testCaseResultSchema],
    // LLM & Code Quality Analysis
    aiAnalysis: {
      qualityScore: { type: Number, default: 0 },
      timeComplexity: { type: String, default: "O(1)" },
      spaceComplexity: { type: String, default: "O(1)" },
      summary: { type: String, default: "" },
      bestPractices: [{ type: String }],
      improvements: [{ type: String }],
    },
    // Plagiarism Detection
    plagiarism: {
      similarityScore: { type: Number, default: 0 }, // 0 to 100 percentage
      flagged: { type: Boolean, default: false },
      matchedSubmission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Submission",
        default: null,
      },
      matchedStudentName: { type: String, default: "" },
      matchedCodeSnippet: { type: String, default: "" },
    },
    facultyGrade: {
      score: { type: Number, default: null },
      feedback: { type: String, default: "" },
      gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      gradedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;
