import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home";
import Login from "./pages/Login.jsx";

// ── Layouts ──────────────────────────────────────────────────────────────────
import AdminDashboard from "./pages/AdminDashboard.jsx";
import SalesDashboard, { SalesDashHome } from "./pages/SalesDashboard.jsx";

// ── Admin Pages ───────────────────────────────────────────────────────────────
import AdminDashHome from "./pages/AdminDashHome.jsx";
import UserManagement from "./pages/UserManagement.jsx";
import CustomerManagement from "./pages/CustomerManagement.jsx";
import LeadManagement from "./pages/LeadManagement.jsx";
import TaskManagement from "./pages/TaskManagement.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";

// ── Guard ─────────────────────────────────────────────────────────────────────
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("token"));

  let user = null;
  try {
    const stored = localStorage.getItem("user");
    user = stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  const getDashboardRoute = () => {
    if (user?.role === "admin") return "/admin-dashboard";
    if (user?.role === "sales") return "/sales-dashboard";
    return "/";
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Routes>
        {/* ── Public ──────────────────────────────────────────────────────── */}
        <Route path="/" element={isAuth ? <Navigate to={getDashboardRoute()} replace /> : <Home />} />
        <Route path="/login" element={isAuth ? <Navigate to={getDashboardRoute()} replace /> : <Login setIsAuth={setIsAuth} />} />

        {/* ── Admin Dashboard ──────────────────────────────────────────────── */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard setIsAuth={setIsAuth} />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashHome />} />
          <Route path="users-management" element={<UserManagement />} />
          <Route path="customers-management" element={<CustomerManagement />} />
          <Route path="leads-management" element={<LeadManagement />} />
          <Route path="tasks-management" element={<TaskManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* ── Sales Dashboard ───────────────────────────────────────────────── */}
        <Route
          path="/sales-dashboard"
          element={
            <ProtectedRoute allowedRoles={["sales"]}>
              <SalesDashboard setIsAuth={setIsAuth} />
            </ProtectedRoute>
          }
        >
          {/* Sales home (default) */}
          <Route index element={<SalesDashHome />} />
          {/* Sales can also access these nested pages */}
          <Route path="leads-management" element={<LeadManagement />} />
          <Route path="tasks-management" element={<TaskManagement />} />
          <Route path="customers-management" element={<CustomerManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* ── 404 ──────────────────────────────────────────────────────────── */}
        <Route
          path="*"
          element={
            <div className="flex min-h-screen flex-col items-center justify-center bg-white text-center">
              <div className="mb-4 text-8xl">🚫</div>
              <h1 className="text-3xl font-extrabold text-slate-900">404 — Page Not Found</h1>
              <p className="mt-3 text-slate-500">The page you're looking for doesn't exist.</p>
              <a href="/" className="mt-6 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90">
                Go Home
              </a>
            </div>
          }
        />
      </Routes>
    </>
  );
}

export default App;