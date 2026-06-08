import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { HiX } from "react-icons/hi";
import {
  FiGrid,
  FiUsers,
  FiUser,
  FiTrendingUp,
  FiCheckSquare,
  FiBarChart2,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";
import { logoutUser } from "../api/Authentication.js";

const menuItems = [
  { name: "Dashboard", path: "", icon: <FiGrid size={18} /> },
  { name: "Users", path: "users-management", icon: <FiUsers size={18} /> },
  {
    name: "Customers",
    path: "customers-management",
    icon: <FiUser size={18} />,
  },
  { name: "Leads", path: "leads-management", icon: <FiTrendingUp size={18} /> },
  {
    name: "Tasks",
    path: "tasks-management",
    icon: <FiCheckSquare size={18} />,
  },
  { name: "Reports", path: "reports", icon: <FiBarChart2 size={18} /> },
  { name: "Settings", path: "settings", icon: <FiSettings size={18} /> },
];

const SidebarContent = ({ setSidebarOpen, onLogout, isLoggingOut }) => {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="mb-6 flex items-center justify-between lg:hidden">
        <div>
          <h3 className="text-lg font-bold text-white">🧑‍💼</h3>
          <p className="text-xs text-slate-400">SmartCRM</p>
        </div>

        <button
          onClick={() => setSidebarOpen(false)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
        >
          <HiX size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(34,211,238,0.4)_transparent]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/15 to-indigo-500/15 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Admin Panel
            </p>
            <h3 className="mt-2 text-xl font-bold text-white">System Boss</h3>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              Full control over users, customers, leads, reports and settings.
            </p>
          </div>

          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <Motion.div
                key={item.name}
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <NavLink
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  end={item.path === ""}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-[0_12px_28px_rgba(34,211,238,0.28)]"
                        : "border border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-cyan-300 shadow-inner transition group-hover:scale-105">
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </NavLink>
              </Motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-white/10 pt-5">
        <button
          onClick={onLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-red-300">
            <FiLogOut size={18} />
          </span>
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
};

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      await logoutUser();

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setSidebarOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      alert(error?.response?.data?.message || "Logout failed");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-6 top-28 z-30 hidden h-[calc(100vh-8rem)] w-72 rounded-[2rem] border border-white/10 bg-slate-950/90 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl lg:block">
        <SidebarContent
          setSidebarOpen={setSidebarOpen}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
            />

            <Motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              className="fixed left-0 top-0 z-50 h-screen w-[88%] max-w-xs border-r border-white/10 bg-slate-950 p-5 shadow-2xl lg:hidden"
            >
              <div className="h-full pt-4">
                <SidebarContent
                  setSidebarOpen={setSidebarOpen}
                  onLogout={handleLogout}
                  isLoggingOut={isLoggingOut}
                />
              </div>
            </Motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminSidebar;
