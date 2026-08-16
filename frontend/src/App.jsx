import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import StudentDashboard from "./pages/Student/StudentDashboard";
import CodeWorkspace from "./pages/Student/CodeWorkspace";
import StudentSubmissions from "./pages/Student/StudentSubmissions";
import FacultyDashboard from "./pages/Faculty/FacultyDashboard";
import CreateAssignment from "./pages/Faculty/CreateAssignment";
import SubmissionReview from "./pages/Faculty/SubmissionReview";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Navbar from "./components/Navbar";
import { api } from "./services/api";


function ProtectedRoute({ user, allowedRoles, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to respective home dashboard based on role
    if (user.role === "student") return <Navigate to="/student/dashboard" replace />;
    if (user.role === "faculty") return <Navigate to="/faculty/dashboard" replace />;
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        const res = await api.getCurrentUser();
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem("user", JSON.stringify(res.user));
        }
      } catch (err) {
        console.error("Session verification failed", err);
      }
    }
    setLoading(false);
  };

  const handleLoginSuccess = (userData, token) => {
    setUser(userData);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#070b14]">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-violet-500/20 border-t-violet-400 animate-spin"></div>
          <div className="w-9 h-9 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin absolute top-2.5 left-2.5"></div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 relative">
        <div className="grain"></div>

        {user && <Navbar user={user} onLogout={handleLogout} />}

        <main className="flex-1 relative z-10">
          <Routes>
            {/* Root Route Redirect */}
            <Route
              path="/"
              element={
                user ? (
                  user.role === "student" ? (
                    <Navigate to="/student/dashboard" replace />
                  ) : user.role === "faculty" ? (
                    <Navigate to="/faculty/dashboard" replace />
                  ) : (
                    <Navigate to="/admin/dashboard" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Auth Routes */}
            <Route
              path="/login"
              element={
                user ? (
                  <Navigate to="/" replace />
                ) : (
                  <Login onLoginSuccess={handleLoginSuccess} />
                )
              }
            />
            <Route
              path="/signup"
              element={
                user ? (
                  <Navigate to="/" replace />
                ) : (
                  <Signup onLoginSuccess={handleLoginSuccess} />
                )
              }
            />

            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute user={user} allowedRoles={["student"]}>
                  <StudentDashboard user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/workspace/:assignmentId"
              element={
                <ProtectedRoute user={user} allowedRoles={["student"]}>
                  <CodeWorkspace user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/submissions"
              element={
                <ProtectedRoute user={user} allowedRoles={["student"]}>
                  <StudentSubmissions user={user} />
                </ProtectedRoute>
              }
            />

            {/* Faculty Routes */}
            <Route
              path="/faculty/dashboard"
              element={
                <ProtectedRoute user={user} allowedRoles={["faculty"]}>
                  <FacultyDashboard user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/create-assignment"
              element={
                <ProtectedRoute user={user} allowedRoles={["faculty"]}>
                  <CreateAssignment user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/submissions/:assignmentId"
              element={
                <ProtectedRoute user={user} allowedRoles={["faculty"]}>
                  <SubmissionReview user={user} />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute user={user} allowedRoles={["admin"]}>
                  <AdminDashboard user={user} />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}