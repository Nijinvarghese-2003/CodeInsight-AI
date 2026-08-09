import Submission from "../models/Submission.js";
import Assignment from "../models/Assignment.js";
import { runJudge0Tests } from "../services/judge0Service.js";
import { analyzeCodeQuality } from "../services/llmAnalysisService.js";
import { checkPlagiarism } from "../services/plagiarismService.js";

// @desc    Submit code solution for assignment (Student only)
// @route   POST /api/submissions
// @access  Private/Student
export const submitSolution = async (req, res) => {
  try {
    const { assignmentId, submittedLanguage, code } = req.body;

    if (!assignmentId || !submittedLanguage || !code) {
      return res.status(400).json({
        success: false,
        message: "Assignment ID, language, and source code are required",
      });
    }

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // STRICT LANGUAGE LOCK VERIFICATION
    if (submittedLanguage.toLowerCase() !== assignment.requiredLanguage.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: `Language restriction error: This assignment is locked to '${assignment.requiredLanguage.toUpperCase()}' for course ${assignment.courseCode} (${assignment.courseName}). You cannot submit using '${submittedLanguage.toUpperCase()}'.`,
      });
    }

    // 1. Run Judge0 Test Suite against assignment test cases
    const judge0Results = await runJudge0Tests(
      code,
      submittedLanguage,
      assignment.testCases || []
    );

    // 2. Perform Plagiarism Detection against peer student submissions
    const plagiarismResults = await checkPlagiarism(
      assignmentId,
      req.user._id,
      code
    );

    // 3. Perform AI Code Quality & Time Complexity ($O(N)$, $O(N^2)$, etc.) Analysis
    const aiAnalysisResults = await analyzeCodeQuality(code, submittedLanguage);

    // Create Submission document
    const submission = await Submission.create({
      assignment: assignmentId,
      student: req.user._id,
      submittedLanguage: submittedLanguage.toLowerCase(),
      code,
      status: judge0Results.status,
      score: judge0Results.score,
      passedCount: judge0Results.passedCount,
      totalCount: judge0Results.totalCount,
      testCaseResults: judge0Results.testCaseResults,
      aiAnalysis: aiAnalysisResults,
      plagiarism: plagiarismResults,
    });

    const populatedSubmission = await Submission.findById(submission._id)
      .populate("student", "name rollNo email")
      .populate("assignment", "title courseCode courseName requiredLanguage maxPoints");

    res.status(201).json({
      success: true,
      message: "Solution submitted and analyzed successfully",
      submission: populatedSubmission,
    });
  } catch (error) {
    console.error("Submission processing error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process submission",
    });
  }
};

// @desc    Get student's own submissions
// @route   GET /api/submissions/my
// @access  Private/Student
export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate("assignment", "title courseCode courseName requiredLanguage maxPoints deadline")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch submissions",
    });
  }
};

// @desc    Get all submissions for an assignment (Faculty/Admin)
// @route   GET /api/submissions/assignment/:assignmentId
// @access  Private/Faculty/Admin
export const getAssignmentSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({
      assignment: req.params.assignmentId,
    })
      .populate("student", "name rollNo studentId email department")
      .populate("assignment", "title courseCode courseName requiredLanguage maxPoints")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch assignment submissions",
    });
  }
};

// @desc    Grade & feedback submission (Faculty only)
// @route   PUT /api/submissions/:id/grade
// @access  Private/Faculty
export const gradeSubmission = async (req, res) => {
  try {
    const { score, feedback } = req.body;

    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    submission.facultyGrade = {
      score: score !== undefined ? score : submission.score,
      feedback: feedback || "",
      gradedBy: req.user._id,
      gradedAt: new Date(),
    };

    await submission.save();

    res.status(200).json({
      success: true,
      message: "Submission graded successfully",
      submission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to grade submission",
    });
  }
};
