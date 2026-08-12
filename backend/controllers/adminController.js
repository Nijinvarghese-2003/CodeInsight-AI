import User from "../models/User.js";
import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import PreApprovedUser from "../models/PreApprovedUser.js";

// @desc    Get platform metrics & stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const studentsCount = await User.countDocuments({ role: "student" });
    const facultyCount = await User.countDocuments({ role: "faculty" });
    const adminCount = await User.countDocuments({ role: "admin" });
    const pendingFacultyCount = await User.countDocuments({ role: "faculty", status: "pending" });
    const preApprovedCount = await PreApprovedUser.countDocuments();

    const totalAssignments = await Assignment.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    const flaggedPlagiarismCount = await Submission.countDocuments({
      "plagiarism.flagged": true,
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        studentsCount,
        facultyCount,
        adminCount,
        pendingFacultyCount,
        preApprovedCount,
        totalAssignments,
        totalSubmissions,
        flaggedPlagiarismCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch platform stats",
    });
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("department", "name code")
      .populate("course", "name code")
      .populate("teachingLabs", "name code requiredLanguage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch users",
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["student", "faculty", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update user role",
    });
  }
};

// @desc    Toggle user status (active/blocked/inactive/pending)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
export const toggleUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "inactive", "blocked", "pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status specified",
      });
    }

    const updateObj = { status };
    if (status === "active") updateObj.isApproved = true;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateObj,
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update user status",
    });
  }
};

// --- PRE-APPROVED LIST MANAGEMENT ---

// @desc    Get pre-approved user details list
// @route   GET /api/admin/preapproved
// @access  Private/Admin
export const getPreApprovedUsers = async (req, res) => {
  try {
    const list = await PreApprovedUser.find()
      .populate("department", "name code")
      .populate("course", "name code")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: list.length,
      preApprovedUsers: list,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch pre-approved users",
    });
  }
};

// @desc    Add a pre-approved user entry
// @route   POST /api/admin/preapproved
// @access  Private/Admin
export const addPreApprovedUser = async (req, res) => {
  try {
    const { role, officialId, email, name, department, course } = req.body;

    if (!role || !officialId || !email) {
      return res.status(400).json({
        success: false,
        message: "Role, Official ID (Student/Faculty ID), and Official Email are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedOfficialId = officialId.trim().toUpperCase();

    const existing = await PreApprovedUser.findOne({
      role,
      email: normalizedEmail,
      officialId: normalizedOfficialId,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This pre-approved record already exists",
      });
    }

    const newRecord = await PreApprovedUser.create({
      role,
      officialId: normalizedOfficialId,
      email: normalizedEmail,
      name: name || "",
      department: department || null,
      course: course || null,
    });

    const populated = await PreApprovedUser.findById(newRecord._id)
      .populate("department", "name code")
      .populate("course", "name code");

    res.status(201).json({
      success: true,
      message: "Pre-approved record added successfully",
      preApprovedUser: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add pre-approved user",
    });
  }
};

// @desc    Delete pre-approved record
// @route   DELETE /api/admin/preapproved/:id
// @access  Private/Admin
export const deletePreApprovedUser = async (req, res) => {
  try {
    const record = await PreApprovedUser.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Pre-approved record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Pre-approved record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete record",
    });
  }
};

// @desc    Seed sample pre-approved data for quick testing
// @route   POST /api/admin/preapproved/seed
// @access  Private/Admin
export const seedPreApprovedDefaults = async (req, res) => {
  try {
    const sampleRecords = [
      { role: "student", officialId: "CS2026-001", email: "student1@campus.edu", name: "Alice Johnson" },
      { role: "student", officialId: "CS2026-002", email: "student2@campus.edu", name: "Bob Smith" },
      { role: "faculty", officialId: "EMP-101", email: "faculty1@campus.edu", name: "Dr. Alan Turing" },
      { role: "faculty", officialId: "EMP-102", email: "faculty2@campus.edu", name: "Prof. Grace Hopper" },
    ];

    let count = 0;
    for (const rec of sampleRecords) {
      const exists = await PreApprovedUser.findOne({
        role: rec.role,
        email: rec.email,
        officialId: rec.officialId,
      });
      if (!exists) {
        await PreApprovedUser.create(rec);
        count++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Seeded ${count} default pre-approved records`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to seed pre-approved records",
    });
  }
};

// --- FACULTY APPROVAL & LAB SUBJECT ASSIGNMENT ---

// @desc    Get pending faculty registration requests
// @route   GET /api/admin/pending-faculties
// @access  Private/Admin
export const getPendingFaculties = async (req, res) => {
  try {
    const pendingFaculties = await User.find({
      role: "faculty",
      $or: [{ status: "pending" }, { isApproved: false }],
    })
      .select("-password")
      .populate("department", "name code")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pendingFaculties.length,
      faculties: pendingFaculties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch pending faculty requests",
    });
  }
};

// @desc    Approve faculty registration request by assigning lab subjects
// @route   PUT /api/admin/approve-faculty/:id
// @access  Private/Admin
export const approveFacultyWithLabs = async (req, res) => {
  try {
    const { teachingLabs } = req.body;

    if (!teachingLabs || !Array.isArray(teachingLabs) || teachingLabs.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one lab subject to assign to the faculty",
      });
    }

    const faculty = await User.findById(req.params.id);
    if (!faculty || faculty.role !== "faculty") {
      return res.status(404).json({
        success: false,
        message: "Faculty user not found",
      });
    }

    faculty.teachingLabs = teachingLabs;
    faculty.isApproved = true;
    faculty.status = "active";

    await faculty.save();

    const updatedFaculty = await User.findById(faculty._id)
      .select("-password")
      .populate("department", "name code")
      .populate("teachingLabs", "name code requiredLanguage");

    res.status(200).json({
      success: true,
      message: `Faculty ${faculty.name} approved successfully with ${teachingLabs.length} assigned lab subject(s)`,
      faculty: updatedFaculty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to approve faculty",
    });
  }
};

// @desc    Reject pending faculty registration request
// @route   DELETE /api/admin/reject-faculty/:id
// @access  Private/Admin
export const rejectFaculty = async (req, res) => {
  try {
    const faculty = await User.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty registration request not found",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    // Optionally reset PreApprovedUser isRegistered flag
    if (faculty.email && faculty.employeeId) {
      await PreApprovedUser.findOneAndUpdate(
        { role: "faculty", email: faculty.email, officialId: faculty.employeeId },
        { isRegistered: false }
      );
    }

    res.status(200).json({
      success: true,
      message: `Faculty registration request rejected and removed`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to reject faculty request",
    });
  }
};

// @desc    Update assigned teaching labs for existing active faculty member
// @route   PUT /api/admin/faculty/:id/labs
// @access  Private/Admin
export const updateFacultyLabs = async (req, res) => {
  try {
    const { teachingLabs } = req.body;

    if (!teachingLabs || !Array.isArray(teachingLabs)) {
      return res.status(400).json({
        success: false,
        message: "teachingLabs must be an array of LabSubject IDs",
      });
    }

    const faculty = await User.findByIdAndUpdate(
      req.params.id,
      { teachingLabs },
      { new: true }
    )
      .select("-password")
      .populate("department", "name code")
      .populate("teachingLabs", "name code requiredLanguage");

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty member not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Assigned lab subjects updated for ${faculty.name}`,
      faculty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update assigned lab subjects",
    });
  }
};
