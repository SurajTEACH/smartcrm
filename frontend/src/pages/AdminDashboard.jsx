import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar.jsx";
import AdminSidebar from "../components/AdminSidebar.jsx";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ✅ Navbar FIX */}
      <AdminNavbar toggleSidebar={() => setSidebarOpen(true)} />

      {/* ✅ Sidebar FIX */}
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* ✅ Dynamic Content */}
      <main className="min-h-screen bg-white px-3 pb-6 pt-34 sm:px-5 lg:ml-[19.5rem] lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;