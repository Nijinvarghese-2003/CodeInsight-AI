const API_BASE_URL = "/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  signup: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  getCurrentUser: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Assignments
  getAssignments: async () => {
    const res = await fetch(`${API_BASE_URL}/assignments`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  getAssignmentById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/assignments/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createAssignment: async (assignmentData) => {
    const res = await fetch(`${API_BASE_URL}/assignments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(assignmentData),
    });
    return res.json();
  },

  deleteAssignment: async (id) => {
    const res = await fetch(`${API_BASE_URL}/assignments/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Submissions
  submitSolution: async (submissionData) => {
    const res = await fetch(`${API_BASE_URL}/submissions`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(submissionData),
    });
    return res.json();
  },

  getMySubmissions: async () => {
    const res = await fetch(`${API_BASE_URL}/submissions/my`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  getAssignmentSubmissions: async (assignmentId) => {
    const res = await fetch(`${API_BASE_URL}/submissions/assignment/${assignmentId}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  gradeSubmission: async (submissionId, gradeData) => {
    const res = await fetch(`${API_BASE_URL}/submissions/${submissionId}/grade`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(gradeData),
    });
    return res.json();
  },

  // Admin
  getAdminStats: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  getUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  updateUserRole: async (userId, role) => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });
    return res.json();
  },

  toggleUserStatus: async (userId, status) => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },
};
