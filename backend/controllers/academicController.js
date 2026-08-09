import Department from "../models/Department.js";
import Course from "../models/Course.js";
import LabSubject from "../models/LabSubject.js";

// ==================== DEPARTMENTS ====================

export const createDepartment = async (req, res) => {
  try {
    const { name, code, description } = req.body;
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Department name and code are required",
      });
    }

    const existing = await Department.findOne({
      $or: [{ name }, { code: code.toUpperCase() }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Department with this name or code already exists",
      });
    }

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description: description || "",
    });

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: departments.length, departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }
    // Delete associated courses and lab subjects
    await Course.deleteMany({ department: dept._id });
    await LabSubject.deleteMany({ department: dept._id });
    await dept.deleteOne();

    res.status(200).json({ success: true, message: "Department and associated programs deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== COURSES / PROGRAMS ====================

export const createCourse = async (req, res) => {
  try {
    const { name, code, departmentId, durationYears } = req.body;
    if (!name || !code || !departmentId) {
      return res.status(400).json({
        success: false,
        message: "Course name, code, and department reference are required",
      });
    }

    const dept = await Department.findById(departmentId);
    if (!dept) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    const existing = await Course.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Course code already exists",
      });
    }

    const course = await Course.create({
      name,
      code: code.toUpperCase(),
      department: departmentId,
      durationYears: durationYears || 4,
    });

    const populatedCourse = await Course.findById(course._id).populate("department", "name code");

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: populatedCourse,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCourses = async (req, res) => {
  try {
    const { departmentId } = req.query;
    let query = {};
    if (departmentId) {
      query.department = departmentId;
    }

    const courses = await Course.find(query)
      .populate("department", "name code")
      .sort({ name: 1 });

    res.status(200).json({ success: true, count: courses.length, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    await LabSubject.deleteMany({ course: course._id });
    await course.deleteOne();

    res.status(200).json({ success: true, message: "Course and associated labs deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== LAB SUBJECTS ====================

export const createLabSubject = async (req, res) => {
  try {
    const { name, code, courseId, requiredLanguage, description } = req.body;
    if (!name || !code || !courseId || !requiredLanguage) {
      return res.status(400).json({
        success: false,
        message: "Lab name, code, courseId, and locked programming language are required",
      });
    }

    const courseObj = await Course.findById(courseId);
    if (!courseObj) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const labSubject = await LabSubject.create({
      name,
      code: code.toUpperCase(),
      course: courseId,
      department: courseObj.department,
      requiredLanguage: requiredLanguage.toLowerCase(),
      description: description || "",
    });

    const populatedLab = await LabSubject.findById(labSubject._id)
      .populate("course", "name code")
      .populate("department", "name code");

    res.status(201).json({
      success: true,
      message: "Lab subject created successfully",
      labSubject: populatedLab,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLabSubjects = async (req, res) => {
  try {
    const { courseId, departmentId } = req.query;
    let query = {};
    if (courseId) query.course = courseId;
    if (departmentId) query.department = departmentId;

    const labSubjects = await LabSubject.find(query)
      .populate("course", "name code")
      .populate("department", "name code")
      .sort({ name: 1 });

    res.status(200).json({ success: true, count: labSubjects.length, labSubjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLabSubject = async (req, res) => {
  try {
    const lab = await LabSubject.findById(req.params.id);
    if (!lab) {
      return res.status(404).json({ success: false, message: "Lab subject not found" });
    }
    await lab.deleteOne();
    res.status(200).json({ success: true, message: "Lab subject deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== FULL HIERARCHY TREE ====================

export const getAcademicHierarchy = async (req, res) => {
  try {
    const departments = await Department.find().lean();
    const courses = await Course.find().lean();
    const labs = await LabSubject.find().lean();

    const hierarchy = departments.map((dept) => {
      const deptCourses = courses
        .filter((c) => c.department.toString() === dept._id.toString())
        .map((c) => {
          const courseLabs = labs.filter(
            (l) => l.course.toString() === c._id.toString()
          );
          return { ...c, labs: courseLabs };
        });
      return { ...dept, courses: deptCourses };
    });

    res.status(200).json({ success: true, hierarchy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
