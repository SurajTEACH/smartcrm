import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import { RiBarChartBoxFill } from "react-icons/ri";
import { FiBell, FiCheckCircle, FiCheck, FiClock, FiX } from "react-icons/fi";
import api from "../api/axios.js";

const activityColors = {
  lead: "bg-cyan-100 text-cyan-600 border-cyan-200",
  customer: "bg-emerald-100 text-emerald-600 border-emerald-200",
  task: "bg-violet-100 text-violet-600 border-violet-200",
};

const AdminNavbar = ({ toggleSidebar }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [unread, setUnread] = useState(0);
  const [activities, setActivities] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Poll for unread notifications hint via recent activities count
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/analytics/recent-activities");
      const list = res.data.activities || [];
      setActivities(list);
      setUnread(Math.min(list.length, 6));
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = () => {
    setUnread(0);
  };

  return (
    <div className="fixed left-0 right-0 top-0 z-50 w-full px-3 pt-4 sm:px-5 lg:px-8">
      <Motion.nav
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        className="relative mx-auto flex max-w-[1600px] items-center justify-between rounded-full border border-white/10 bg-slate-950/90 px-3 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl sm:px-4"
      >
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

        {/* Left */}
        <div className="flex min-w-0 items-center gap-3">
          <Motion.button whileTap={{ scale: 0.94 }} onClick={toggleSidebar}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 shadow-lg lg:hidden">
            <HiOutlineMenuAlt3 size={22} />
          </Motion.button>

          <Link to="/admin-dashboard" className="group flex min-w-0 items-center gap-3">
            <Motion.div whileHover={{ rotate: -8, scale: 1.06 }} transition={{ type: "spring", stiffness: 260 }}
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 text-white shadow-[0_10px_26px_rgba(14,165,233,0.35)]">
              <span className="absolute inset-0 rounded-full bg-white/10 blur-[1px]" />
              <RiBarChartBoxFill className="relative z-10 text-[23px]" />
            </Motion.div>
            <div className="min-w-0">
              <h2 className="truncate bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-lg font-extrabold leading-none text-transparent sm:text-[1.75rem]">
                SmartCRM
              </h2>
              <p className="mt-1 hidden truncate text-xs font-medium text-slate-400 sm:block">Admin control center</p>
            </div>
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications bell with dropdown */}
          <div className="relative" ref={dropdownRef}>
            <Motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowDropdown(!showDropdown);
                if (!showDropdown) handleMarkAsRead();
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 hover:text-white transition"
            >
              <FiBell size={18} />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 text-[10px] font-bold text-white shadow-lg">
                  {unread}
                </span>
              )}
            </Motion.button>

            {/* Notification Dropdown Panel */}
            <AnimatePresence>
              {showDropdown && (
                <Motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 mt-3 w-80 overflow-hidden rounded-[26px] border border-slate-200 bg-white p-4 shadow-2xl text-slate-800 z-50"
                >
                  <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="font-bold text-slate-900 text-sm">System Notifications</h4>
                    <button
                      onClick={() => setUnread(0)}
                      className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 inline-flex items-center gap-1"
                    >
                      <FiCheck size={13} /> Clear badge
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                    {activities.length === 0 ? (
                      <p className="py-8 text-center text-xs text-slate-400">No new notifications</p>
                    ) : (
                      activities.slice(0, 6).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 hover:bg-slate-50 transition"
                        >
                          <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${activityColors[item.type] || "bg-slate-100"}`}>
                            <FiCheckCircle size={13} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs leading-4 font-medium text-slate-700 break-words">{item.message}</p>
                            <span className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                              <FiClock size={10} />
                              {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User badge */}
          <Motion.div whileHover={{ y: -2, scale: 1.02 }}
            className="hidden md:flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-indigo-600 text-sm font-bold text-white shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{user?.name || "Admin"}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role || "admin"}</p>
            </div>
          </Motion.div>

          <Motion.div whileHover={{ scale: 1.05 }}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-indigo-600 text-sm font-bold text-white shadow-lg md:hidden">
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </Motion.div>
        </div>
      </Motion.nav>
    </div>
  );
};

export default AdminNavbar;
