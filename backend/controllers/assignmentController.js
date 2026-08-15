import Assignment from "../models/Assignment.js";
import LabSubject from "../models/LabSubject.js";

// @desc    Create new assignment (Faculty only)
// @route   POST /api/assignments
// @access  Private/Faculty
export const createAssignment = async (req, res) => {
  try {
    const {
      labSubjectId,
      title,
      courseCode,
      courseName,
      requiredLanguage,
      description,
      instructions,
      testCases,
      deadline,
      maxPoints,
    } = req.body;

    if (!title || !description || !deadline) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields: title, description, deadline",
      });
    }

    let departmentId = null;
    let courseId = null;
    let targetLabId = labSubjectId || null;
    let finalCourseCode = courseCode || "LAB101";
    let finalCourseName = courseName || "Programming Lab";
    let finalRequiredLang = (requiredLanguage || "c").toLowerCase();

    if (labSubjectId) {
      const labSubject = await LabSubject.findById(labSubjectId)
        .populate("course", "name code")
        .populate("department", "name code");

      if (labSubject) {
        departmentId = labSubject.department?._id || null;
        courseId = labSubject.course?._id || null;
        finalCourseCode = labSubject.code || finalCourseCode;
        finalCourseName = labSubject.course?.name
          ? `${labSubject.course.name} - ${labSubject.name}`
          : labSubject.name || finalCourseName;
        finalRequiredLang = labSubject.requiredLanguage
          ? labSubject.requiredLanguage.toLowerCase()
          : finalRequiredLang;
      }
    }

    const assignment = await Assignment.create({
      title,
      department: departmentId,
      course: courseId,
      labSubject: targetLabId,
      courseCode: finalCourseCode,
      courseName: finalCourseName,
      requiredLanguage: finalRequiredLang,
      description,
      instructions: instructions || "",
      testCases: testCases || [],
      deadline,
      maxPoints: maxPoints || 100,
      createdBy: req.user._id,
    });

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate("department", "name code")
      .populate("course", "name code")
      .populate("labSubject", "name code requiredLanguage")
      .populate("createdBy", "name email department");

    res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      assignment: populatedAssignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create assignment",
    });
  }
};

// @desc    Get all assignments (Filtered strictly by Role & Course)
// @route   GET /api/assignments
// @access  Private
export const getAssignments = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "faculty") {
      query.createdBy = req.user._id;
    } else if (req.user.role === "student") {
      // STUDENTS ONLY SEE ASSIGNMENTS FOR THEIR ENROLLED COURSE!
      if (!req.user.course) {
        return res.status(200).json({
          success: true,
          count: 0,
          assignments: [],
          message: "You are not enrolled in any course program.",
        });
      }
      query.course = req.user.course;
    }

    const assignments = await Assignment.find(query)
      .populate("department", "name code")
      .populate("course", "name code")
      .populate("labSubject", "name code requiredLanguage")
      .populate("createdBy", "name email department")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch assignments",
    });
  }
};

// @desc    Get single assignment by ID
// @route   GET /api/assignments/:id
// @access  Private
export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("department", "name code")
      .populate("course", "name code")
      .populate("labSubject", "name code requiredLanguage")
      .populate("createdBy", "name email department");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    let assignmentData = assignment.toObject();
    if (req.user.role === "student") {
      assignmentData.testCases = assignmentData.testCases.filter(
        (tc) => !tc.isHidden
      );
    }

    res.status(200).json({
      success: true,
      assignment: assignmentData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch assignment details",
    });
  }
};

// @desc    Update assignment (Faculty only)
// @route   PUT /api/assignments/:id
// @access  Private/Faculty
export const updateAssignment = async (req, res) => {
  try {
    let assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    if (
      assignment.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this assignment",
      });
    }

    assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Assignment updated successfully",
      assignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update assignment",
    });
  }
};

// @desc    Delete assignment (Faculty/Admin only)
// @route   DELETE /api/assignments/:id
// @access  Private/Faculty/Admin
export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    if (
      assignment.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this assignment",
      });
    }

    await assignment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete assignment",
    });
  }
};
