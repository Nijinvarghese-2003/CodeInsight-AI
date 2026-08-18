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

    // 3. Perform AI Code Quality & Complexity Analysis
    const aiAnalysisResults = await analyzeCodeQuality(
      code,
      submittedLanguage
    );

    // Determine if submission is Late (past assignment deadline)
    let isLate = false;
    if (assignment.deadline) {
      const deadlineDate = new Date(assignment.deadline);
      if (new Date() > deadlineDate) {
        isLate = true;
      }
    }

    // Check if an existing submission exists for this student and assignment
    let submission = await Submission.findOne({
      assignment: assignmentId,
      student: req.user._id,
    });

    if (submission) {
      // Update existing submission in place
      submission.submittedLanguage = submittedLanguage.toLowerCase();
      submission.code = code;
      submission.status = judge0Results.status;
      submission.score = judge0Results.score;
      submission.passedCount = judge0Results.passedCount;
      submission.totalCount = judge0Results.totalCount;
      submission.testCaseResults = judge0Results.testCaseResults;
      submission.aiAnalysis = aiAnalysisResults;
      submission.plagiarism = plagiarismResults;
      submission.isLate = isLate;

      await submission.save();
    } else {
      // Create new submission document
      submission = await Submission.create({
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
        isLate,
      });
    }

    const populatedSubmission = await Submission.findById(submission._id)
      .populate("student", "name rollNo email")
      .populate("assignment", "title courseCode courseName requiredLanguage maxPoints deadline");

    res.status(200).json({
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
      .sort({ updatedAt: -1, createdAt: -1 });

    // Deduplicate by assignment (keeping the latest submission per assignment)
    const latestByAssignment = new Map();
    for (const sub of submissions) {
      const assId = sub.assignment?._id?.toString() || sub.assignment?.toString();
      if (assId && !latestByAssignment.has(assId)) {
        latestByAssignment.set(assId, sub);
      }
    }
    const uniqueSubmissions = Array.from(latestByAssignment.values());

    res.status(200).json({
      success: true,
      count: uniqueSubmissions.length,
      submissions: uniqueSubmissions,
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
      .populate("assignment", "title courseCode courseName requiredLanguage maxPoints deadline")
      .sort({ updatedAt: -1, createdAt: -1 });

    // Deduplicate by student (keeping the latest submission per student)
    const latestByStudent = new Map();
    for (const sub of submissions) {
      const studentId = sub.student?._id?.toString() || sub.student?.toString();
      if (studentId && !latestByStudent.has(studentId)) {
        latestByStudent.set(studentId, sub);
      }
    }
    const uniqueSubmissions = Array.from(latestByStudent.values());

    res.status(200).json({
      success: true,
      count: uniqueSubmissions.length,
      submissions: uniqueSubmissions,
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
