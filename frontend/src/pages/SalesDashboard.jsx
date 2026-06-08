import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import {
  FiTarget, FiCheckSquare, FiUser, FiBarChart2,
  FiSettings, FiLogOut, FiGrid, FiMenu, FiX,
  FiUsers, FiRefreshCw, FiTrendingUp, FiClock,
  FiArrowUpRight, FiCheckCircle, FiAlertCircle,
  FiBell, FiCheck,
} from "react-icons/fi";
import { RiBarChartBoxFill } from "react-icons/ri";
import { logoutUser } from "../api/Authentication.js";
import {
  getDashboardStatsApi,
  getMonthlyTrendApi,
  getLeadFunnelApi,
  getRecentActivitiesApi,
} from "../api/Analytics.js";

const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

const saleMenuItems = [
  { name: "Dashboard", path: "", icon: <FiGrid size={18} />, end: true },
  { name: "My Leads", path: "leads-management", icon: <FiTarget size={18} /> },
  { name: "My Tasks", path: "tasks-management", icon: <FiCheckSquare size={18} /> },
  { name: "Customers", path: "customers-management", icon: <FiUsers size={18} /> },
  { name: "Reports", path: "reports", icon: <FiBarChart2 size={18} /> },
  { name: "Settings", path: "settings", icon: <FiSettings size={18} /> },
];

const funnelColors = {
  New: "bg-blue-500",
  Contacted: "bg-amber-500",
  Interested: "bg-emerald-500",
  Not_Interested: "bg-rose-500",
  Converted: "bg-violet-500",
};
const funnelBg = {
  New: "bg-blue-50 text-blue-700 border-blue-200",
  Contacted: "bg-amber-50 text-amber-700 border-amber-200",
  Interested: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Not_Interested: "bg-rose-50 text-rose-700 border-rose-200",
  Converted: "bg-violet-50 text-violet-700 border-violet-200",
};
const activityColors = {
  lead: "bg-cyan-100 text-cyan-600",
  customer: "bg-emerald-100 text-emerald-600",
  task: "bg-violet-100 text-violet-600",
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const SalesSidebar = ({ open, setOpen, user, onLogout, loggingOut }) => {
  const content = (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="mb-5 lg:hidden flex items-center justify-between">
        <h3 className="text-white font-bold text-lg">SmartCRM</h3>
        <button onClick={() => setOpen(false)} className="text-white p-2 rounded-full bg-white/10"><FiX size={18} /></button>
      </div>
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/15 to-indigo-500/15 p-4 mb-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {user?.name?.charAt(0)?.toUpperCase() || "S"}
          </div>
          <div>
            <p className="text-white font-bold text-sm">{user?.name || "Sales Agent"}</p>
            <p className="text-cyan-300 text-xs capitalize">{user?.role || "sales"}</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {saleMenuItems.map((item, i) => (
          <Motion.div key={item.name} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
            <NavLink to={item.path} end={!!item.end} onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${isActive
                  ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-[0_12px_28px_rgba(34,211,238,0.28)]"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-cyan-300">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          </Motion.div>
        ))}
      </div>
      <div className="mt-5 border-t border-white/10 pt-4">
        <button onClick={onLogout} disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-60">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-red-300"><FiLogOut size={18} /></span>
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed left-6 top-28 z-30 hidden h-[calc(100vh-8rem)] w-72 rounded-[2rem] border border-white/10 bg-slate-950/90 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:block">
        {content}
      </aside>
      <AnimatePresence>
        {open && (
          <>
            <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden" />
            <Motion.aside initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} transition={{ type: "spring", stiffness: 220, damping: 24 }}
              className="fixed left-0 top-0 z-50 h-screen w-[88%] max-w-xs bg-slate-950 border-r border-white/10 p-5 shadow-2xl lg:hidden">
              <div className="h-full pt-4">{content}</div>
            </Motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── Navbar ───────────────────────────────────────────────────────────────────
const SalesNavbar = ({ toggleSidebar, user }) => {
  const [unread, setUnread] = useState(0);
  const [activities, setActivities] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = React.useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await getRecentActivitiesApi();
      const list = res.data.activities || [];
      setActivities(list);
      setUnread(Math.min(list.length, 6));
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed left-0 right-0 top-0 z-50 w-full px-3 pt-4 sm:px-5 lg:px-8">
      <Motion.nav initial={{ y: -70, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.65 }}
        className="relative mx-auto flex max-w-[1600px] items-center justify-between rounded-full border border-white/10 bg-slate-950/90 px-3 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-4">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
        <div className="flex items-center gap-3">
          <button onClick={toggleSidebar} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 lg:hidden">
            <FiMenu size={22} />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 text-white shadow-lg">
              <RiBarChartBoxFill className="text-[23px]" />
            </div>
            <div>
              <h2 className="bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-lg font-extrabold text-transparent sm:text-2xl">SmartCRM</h2>
              <p className="hidden text-xs font-medium text-slate-400 sm:block">Sales Dashboard</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications bell */}
          <div className="relative" ref={dropdownRef}>
            <Motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowDropdown(!showDropdown);
                if (!showDropdown) setUnread(0);
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
                      <FiCheck size={13} /> Clear
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

          <div className="hidden md:flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center text-sm font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || "S"}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{user?.name || "Sales Agent"}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role || "sales"}</p>
            </div>
          </div>
        </div>
      </Motion.nav>
    </div>
  );
};

// ─── Sales Home ───────────────────────────────────────────────────────────────
export const SalesDashHome = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [stats, setStats] = useState(null);
  const [funnel, setFunnel] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const [s, f, a] = await Promise.all([
        getDashboardStatsApi(),
        getLeadFunnelApi(),
        getRecentActivitiesApi(),
      ]);
      setStats(s.data.stats);
      setFunnel(f.data.funnel || []);
      setActivities(a.data.activities || []);
    } catch { setError("Could not load data. Please refresh."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const my = stats?.myStats || {};

  const kpiCards = [
    { title: "My Total Leads", value: my.myLeads ?? "—", icon: <FiTarget size={20} />, color: "from-violet-500 to-indigo-500", bg: "bg-violet-50", text: "text-violet-700" },
    { title: "My Conversions", value: my.myConversions ?? "—", icon: <FiTrendingUp size={20} />, color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50", text: "text-emerald-700" },
    { title: "My Tasks", value: my.myTasks ?? "—", icon: <FiCheckSquare size={20} />, color: "from-amber-500 to-orange-500", bg: "bg-amber-50", text: "text-amber-700" },
    {
      title: "My Conv. Rate",
      value: my.myLeads > 0 ? `${((my.myConversions / my.myLeads) * 100).toFixed(1)}%` : "0%",
      icon: <FiBarChart2 size={20} />, color: "from-cyan-500 to-sky-500", bg: "bg-cyan-50", text: "text-cyan-700"
    },
  ];

  return (
    <div className="min-h-full bg-white text-slate-900">
      <div className="mx-auto max-w-[1600px]">
        {/* Hero */}
        <Motion.div variants={fadeUp} initial="hidden" animate="show"
          className="relative mb-6 overflow-hidden rounded-[30px] border border-[#dbe8f3] bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-6 py-7 shadow-xl">
          <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute right-0 bottom-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-cyan-300 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse inline-block" />
                Sales Agent Panel
              </div>
              <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
                Welcome, {user?.name || "Sales Agent"} 👋
              </h1>
              <p className="mt-2 text-sm text-slate-300">Your personal sales workspace. Track leads, tasks, and performance.</p>
              <div className="mt-5 flex gap-3 flex-wrap">
                <button onClick={fetchData} className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-cyan-600">
                  <FiRefreshCw size={14} /> Refresh
                </button>
              </div>
            </div>
            {stats && (
              <div className="rounded-[22px] bg-white/10 backdrop-blur p-5 text-white w-full lg:max-w-[260px] border border-white/10">
                <p className="text-xs uppercase tracking-widest text-cyan-300 font-semibold">This Month</p>
                <h3 className="mt-2 text-3xl font-bold">{stats.thisMonth.newLeads}</h3>
                <p className="text-sm text-slate-300 mt-1">New leads total</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-xs text-slate-400">Converted</p>
                    <p className="text-lg font-bold">{stats.thisMonth.convertedLeads}</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-xs text-slate-400">Conv. Rate</p>
                    <p className="text-lg font-bold">{stats.overview.conversionRate}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Motion.div>

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700">
            <FiAlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
            <button onClick={fetchData} className="ml-auto rounded-xl bg-rose-100 px-3 py-1 text-xs font-semibold hover:bg-rose-200">Retry</button>
          </div>
        )}

        {/* My KPIs */}
        <Motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading ? [...Array(4)].map((_, i) => <div key={i} className="h-32 animate-pulse rounded-[24px] bg-slate-100" />) : (
            kpiCards.map((card) => (
              <Motion.div key={card.title} variants={fadeUp} whileHover={{ y: -5, scale: 1.01 }}
                className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-lg">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-md mb-4`}>{card.icon}</div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <h3 className="mt-1 text-3xl font-extrabold text-slate-900">{card.value}</h3>
              </Motion.div>
            ))
          )}
        </Motion.div>

        {/* Lead Funnel + Activity */}
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Lead Funnel */}
          <Motion.div variants={fadeUp} initial="hidden" animate="show"
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">My Lead Pipeline</h3>
            <p className="mt-1 text-sm text-slate-500">Breakdown by status — live from database</p>
            <div className="mt-6 space-y-4">
              {loading ? [...Array(5)].map((_, i) => <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100" />) :
                funnel.map((item) => (
                  <div key={item.status}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${funnelBg[item.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>{item.status.replace("_", " ")}</span>
                      <span className="text-sm font-bold text-slate-700">{item.count} <span className="text-slate-400 font-normal">({item.percentage}%)</span></span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <Motion.div initial={{ width: 0 }} animate={{ width: `${item.percentage}%` }} transition={{ duration: 0.7 }}
                        className={`h-full rounded-full ${funnelColors[item.status] || "bg-slate-400"}`} />
                    </div>
                  </div>
                ))}
            </div>
          </Motion.div>

          {/* Recent Activity */}
          <Motion.div variants={fadeUp} initial="hidden" animate="show"
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
            <p className="mt-1 text-sm text-slate-500">Your latest actions</p>
            <div className="mt-5 space-y-3">
              {loading ? [...Array(5)].map((_, i) => <div key={i} className="h-14 animate-pulse rounded-2xl bg-slate-100" />) :
                activities.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">No recent activity yet.</p>
                ) : activities.slice(0, 7).map((item, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full ${activityColors[item.type] || "bg-slate-100 text-slate-600"}`}>
                      <FiCheckCircle size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-slate-700">{item.message}</p>
                      <p className="text-xs text-slate-400">{new Date(item.time).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
            </div>
          </Motion.div>
        </div>

        {/* Quick Actions */}
        <Motion.div variants={fadeUp} initial="hidden" animate="show" className="mt-6 rounded-[28px] border border-slate-200 bg-gradient-to-r from-slate-900 to-indigo-900 p-6 text-white shadow-xl">
          <h3 className="text-xl font-bold">Quick Actions</h3>
          <p className="mt-1 text-sm text-slate-300">Jump to your most-used features instantly</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {[
              { label: "Add New Lead", path: "leads-management", icon: <FiTarget size={16} />, color: "bg-cyan-500 hover:bg-cyan-600" },
              { label: "My Tasks", path: "tasks-management", icon: <FiCheckSquare size={16} />, color: "bg-indigo-500 hover:bg-indigo-600" },
              { label: "View Customers", path: "customers-management", icon: <FiUsers size={16} />, color: "bg-emerald-500 hover:bg-emerald-600" },
              { label: "My Reports", path: "reports", icon: <FiBarChart2 size={16} />, color: "bg-violet-500 hover:bg-violet-600" },
              { label: "Settings", path: "settings", icon: <FiSettings size={16} />, color: "bg-slate-600 hover:bg-slate-500" },
            ].map((a) => (
              <NavLink key={a.label} to={a.path}
                className={`inline-flex items-center gap-2 rounded-full ${a.color} px-5 py-2.5 text-sm font-semibold text-white shadow-md transition`}>
                {a.icon} {a.label}
              </NavLink>
            ))}
          </div>
        </Motion.div>
      </div>
    </div>
  );
};

// ─── Main SalesDashboard Layout ───────────────────────────────────────────────
const SalesDashboard = ({ setIsAuth }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logoutUser();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsAuth(false);
      navigate("/");
    } catch (err) {
      toast.error("Logout failed. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Toaster position="top-right" />
      <SalesNavbar toggleSidebar={() => setSidebarOpen(true)} user={user} />
      <SalesSidebar open={sidebarOpen} setOpen={setSidebarOpen} user={user} onLogout={handleLogout} loggingOut={loggingOut} />
      <main className="min-h-screen bg-white px-3 pb-6 pt-34 sm:px-5 lg:ml-[19.5rem] lg:px-8">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
};

export default SalesDashboard;
