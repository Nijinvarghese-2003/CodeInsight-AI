const API_BASE_URL = "/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Safe request wrapper that prevents "Unexpected end of JSON input" errors
const request = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type");
    
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = {
          success: false,
          message: text || `Server error (${res.status} ${res.statusText})`,
        };
      }
    }

    if (!res.ok && data && data.success === undefined) {
      data.success = false;
    }

    return data;
  } catch (error) {
    console.error("API Request Error:", error);
    return {
      success: false,
      message:
        "Unable to connect to backend server. Please make sure the backend server is running on port 5000.",
    };
  }
};

export const api = {
  // Auth
  login: async (email, password) => {
    return request(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  },

  sendRegistrationOtp: async (userData) => {
    return request(`${API_BASE_URL}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
  },

  resendRegistrationOtp: async (email) => {
    return request(`${API_BASE_URL}/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  },

  signup: async (userData) => {
    return request(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
  },

  getCurrentUser: async () => {
    return request(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
  },

  // Assignments
  getAssignments: async () => {
    return request(`${API_BASE_URL}/assignments`, {
      headers: getAuthHeaders(),
    });
  },

  getAssignmentById: async (id) => {
    return request(`${API_BASE_URL}/assignments/${id}`, {
      headers: getAuthHeaders(),
    });
  },

  createAssignment: async (assignmentData) => {
    return request(`${API_BASE_URL}/assignments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(assignmentData),
    });
  },

  deleteAssignment: async (id) => {
    return request(`${API_BASE_URL}/assignments/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
  },

  // Submissions
  submitSolution: async (submissionData) => {
    return request(`${API_BASE_URL}/submissions`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(submissionData),
    });
  },

  getMySubmissions: async () => {
    return request(`${API_BASE_URL}/submissions/my`, {
      headers: getAuthHeaders(),
    });
  },

  getAssignmentSubmissions: async (assignmentId) => {
    return request(`${API_BASE_URL}/submissions/assignment/${assignmentId}`, {
      headers: getAuthHeaders(),
    });
  },

  gradeSubmission: async (submissionId, gradeData) => {
    return request(`${API_BASE_URL}/submissions/${submissionId}/grade`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(gradeData),
    });
  },

  // Admin
  getAdminStats: async () => {
    return request(`${API_BASE_URL}/admin/stats`, {
      headers: getAuthHeaders(),
    });
  },

  getUsers: async () => {
    return request(`${API_BASE_URL}/admin/users`, {
      headers: getAuthHeaders(),
    });
  },

  updateUserRole: async (userId, role) => {
    return request(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });
  },

  toggleUserStatus: async (userId, status) => {
    return request(`${API_BASE_URL}/admin/users/${userId}/status`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
  },

  deleteUser: async (userId) => {
    return request(`${API_BASE_URL}/admin/users/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
  },

  // Academic Management
  getDepartments: async () => {
    return request(`${API_BASE_URL}/academic/departments`, {
      headers: getAuthHeaders(),
    });
  },

  createDepartment: async (deptData) => {
    return request(`${API_BASE_URL}/academic/departments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(deptData),
    });
  },

  deleteDepartment: async (id) => {
    return request(`${API_BASE_URL}/academic/departments/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
  },

  getCourses: async (departmentId = "") => {
    const query = departmentId ? `?departmentId=${departmentId}` : "";
    return request(`${API_BASE_URL}/academic/courses${query}`, {
      headers: getAuthHeaders(),
    });
  },

  createCourse: async (courseData) => {
    return request(`${API_BASE_URL}/academic/courses`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData),
    });
  },

  deleteCourse: async (id) => {
    return request(`${API_BASE_URL}/academic/courses/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
  },

  getLabSubjects: async (courseId = "") => {
    const query = courseId ? `?courseId=${courseId}` : "";
    return request(`${API_BASE_URL}/academic/labs${query}`, {
      headers: getAuthHeaders(),
    });
  },

  createLabSubject: async (labData) => {
    return request(`${API_BASE_URL}/academic/labs`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(labData),
    });
  },

  deleteLabSubject: async (id) => {
    return request(`${API_BASE_URL}/academic/labs/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
  },

  getAcademicHierarchy: async () => {
    return request(`${API_BASE_URL}/academic/hierarchy`, {
      headers: getAuthHeaders(),
    });
  },

  // Pre-Approved Directory
  getPreApprovedList: async () => {
    return request(`${API_BASE_URL}/admin/preapproved`, {
      headers: getAuthHeaders(),
    });
  },

  getPreApprovedUsers: async () => {
    return request(`${API_BASE_URL}/admin/preapproved`, {
      headers: getAuthHeaders(),
    });
  },

  addPreApprovedUser: async (data) => {
    return request(`${API_BASE_URL}/admin/preapproved`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },

  deletePreApprovedUser: async (id) => {
    return request(`${API_BASE_URL}/admin/preapproved/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
  },

  // Faculty Approvals & Labs
  getPendingFaculties: async () => {
    return request(`${API_BASE_URL}/admin/pending-faculties`, {
      headers: getAuthHeaders(),
    });
  },

  approveFacultyWithLabs: async (userId, teachingLabs) => {
    return request(`${API_BASE_URL}/admin/approve-faculty/${userId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ teachingLabs }),
    });
  },

  rejectFaculty: async (userId) => {
    return request(`${API_BASE_URL}/admin/reject-faculty/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
  },

  updateFacultyLabs: async (userId, teachingLabs) => {
    return request(`${API_BASE_URL}/admin/faculty/${userId}/labs`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ teachingLabs }),
    });
  },
};
