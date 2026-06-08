import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiUsers, FiTrendingUp, FiTarget, FiArrowUpRight,
  FiCheckCircle, FiBarChart2, FiLayers, FiClock,
  FiSettings, FiFileText, FiUserPlus, FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import {
  getDashboardStatsApi,
  getMonthlyTrendApi,
  getRecentActivitiesApi,
} from "../api/Analytics.js";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

const quickLinks = [
  { title: "User Management", desc: "Create, edit, and manage your sales team.", path: "users-management", icon: <FiUserPlus size={18} />, accent: "from-cyan-500 to-sky-500", light: "bg-cyan-50", text: "text-cyan-700" },
  { title: "Customer Management", desc: "View all customers and maintain records.", path: "customers-management", icon: <FiUsers size={18} />, accent: "from-sky-500 to-blue-500", light: "bg-sky-50", text: "text-sky-700" },
  { title: "Lead Management", desc: "Track lead stages to successful conversions.", path: "leads-management", icon: <FiTarget size={18} />, accent: "from-violet-500 to-indigo-500", light: "bg-violet-50", text: "text-violet-700" },
  { title: "Task Management", desc: "Assign tasks, set deadlines, monitor productivity.", path: "tasks-management", icon: <FiLayers size={18} />, accent: "from-emerald-500 to-teal-500", light: "bg-emerald-50", text: "text-emerald-700" },
  { title: "Reports & Analytics", desc: "Review performance and business insights.", path: "reports", icon: <FiBarChart2 size={18} />, accent: "from-indigo-500 to-blue-500", light: "bg-indigo-50", text: "text-indigo-700" },
  { title: "Settings", desc: "Manage profile, security, and preferences.", path: "settings", icon: <FiSettings size={18} />, accent: "from-slate-600 to-slate-800", light: "bg-slate-100", text: "text-slate-700" },
];

const activityColors = {
  lead: "bg-cyan-100 text-cyan-600",
  customer: "bg-emerald-100 text-emerald-600",
  task: "bg-violet-100 text-violet-600",
};

const AdminDashHome = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, t, a] = await Promise.all([
        getDashboardStatsApi(),
        getMonthlyTrendApi(),
        getRecentActivitiesApi(),
      ]);
      setStats(s.data.stats);
      setTrend(t.data.trend || []);
      setActivities(a.data.activities || []);
    } catch {
      setError("Failed to load dashboard data. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const kpiCards = stats ? [
    { title: "Total Users", value: stats.overview.totalUsers, change: "+Active", progress: "100%", icon: <FiUsers size={22} />, color: "from-cyan-500 to-sky-500", line: "from-cyan-400 to-sky-500" },
    { title: "Total Leads", value: stats.overview.totalLeads, change: `+${stats.thisMonth.newLeads} this month`, progress: `${Math.min(stats.thisMonth.leadsGrowth || 0, 100)}%`, icon: <FiTarget size={22} />, color: "from-violet-500 to-indigo-500", line: "from-violet-400 to-indigo-500" },
    { title: "Converted Deals", value: stats.overview.totalCustomers, change: `+${stats.thisMonth.convertedLeads} this month`, progress: `${Math.min(stats.thisMonth.conversionGrowth || 0, 100)}%`, icon: <FiTrendingUp size={22} />, color: "from-emerald-500 to-green-500", line: "from-emerald-400 to-green-500" },
    { title: "Conversion Rate", value: `${stats.overview.conversionRate}%`, change: "Lead → Customer", progress: `${Math.min(Number(stats.overview.conversionRate), 100)}%`, icon: <FiBarChart2 size={22} />, color: "from-amber-500 to-orange-500", line: "from-amber-400 to-orange-500" },
  ] : [];

  const maxTrend = Math.max(...trend.map((m) => m.leads || 0), 1);

  return (
    <div className="min-h-full bg-white text-[#182033]">
      <div className="mx-auto max-w-[1600px]">

        {/* Hero */}
        <Motion.div variants={fadeUp} initial="hidden" animate="show"
          className="relative mb-6 overflow-hidden rounded-[30px] border border-[#dbe8f3] bg-gradient-to-r from-[#eefbfd] via-white to-[#eef2ff] px-5 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-cyan-200/30 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-indigo-200/30 blur-3xl" />
          <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#14b8d4] shadow-sm backdrop-blur">
                <span className="inline-block h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                SmartCRM Admin Dashboard — Live Data
              </div>
              <h1 className="text-2xl font-extrabold leading-tight text-[#101828] sm:text-3xl xl:text-[2.6rem]">
                Welcome back, {user?.name || "Admin"} 👋
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#516079] sm:text-[15px]">
                Manage your team, customers, leads, deals, reports, and settings from one powerful workspace.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2 text-xs font-semibold text-cyan-700">Live DB insights</span>
                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">Real-time data</span>
                {stats && <span className="rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700">{stats.overview.conversionRate}% conversion rate</span>}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={fetchAll} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1c2233] via-[#25314d] to-[#1eaedb] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02]">
                  <FiRefreshCw size={15} /> Refresh Data
                </button>
                <Link to="leads-management" className="inline-flex items-center gap-2 rounded-full border border-[#d5e6f3] bg-white px-5 py-3 text-sm font-semibold text-[#1c2233] shadow-sm transition hover:border-cyan-200 hover:text-cyan-700">
                  Open Leads <FiTarget size={16} />
                </Link>
              </div>
            </div>

            {/* Summary card */}
            {stats && (
              <Motion.div whileHover={{ y: -4 }} className="w-full rounded-[24px] border border-[#d6eef5] bg-white/90 p-5 shadow-[0_12px_28px_rgba(34,199,238,0.08)] backdrop-blur sm:max-w-[340px]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#14b8d4]">This Month</p>
                <h3 className="mt-2 text-3xl font-bold tracking-tight text-[#101828]">
                  +{stats.thisMonth.newLeads} New Leads
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#5c6b82]">
                  {stats.thisMonth.convertedLeads} conversions · {stats.thisMonth.newCustomers} new customers
                </p>
                <div className="mt-5 space-y-3">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#607089]">
                      <span>Task Completion</span>
                      <span>{stats.overview.completedTasks}/{stats.overview.totalTasks}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-[#e9f1f7]">
                      <Motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.overview.totalTasks > 0 ? Math.round((stats.overview.completedTasks / stats.overview.totalTasks) * 100) : 0}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="rounded-2xl bg-[#f5faff] p-3">
                      <p className="text-xs font-medium text-[#6a7890]">Pending Tasks</p>
                      <h4 className="mt-1 text-lg font-bold text-[#162033]">{stats.overview.pendingTasks}</h4>
                    </div>
                    <div className="rounded-2xl bg-[#f7fbff] p-3">
                      <p className="text-xs font-medium text-[#6a7890]">Total Users</p>
                      <h4 className="mt-1 text-lg font-bold text-[#162033]">{stats.overview.totalUsers}</h4>
                    </div>
                  </div>
                </div>
              </Motion.div>
            )}
          </div>
        </Motion.div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700">
            <FiAlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
            <button onClick={fetchAll} className="ml-auto rounded-xl bg-rose-100 px-3 py-1 text-xs font-semibold hover:bg-rose-200">Retry</button>
          </div>
        )}

        {/* KPI Stats */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-[26px] bg-slate-100" />
            ))}
          </div>
        ) : (
          <Motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpiCards.map((item) => (
              <Motion.div key={item.title} variants={fadeUp} whileHover={{ y: -6, scale: 1.01 }}
                className="group relative overflow-hidden rounded-[26px] border border-[#dbe5ef] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition-all hover:shadow-[0_20px_40px_rgba(15,23,42,0.10)]">
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-cyan-100/30 blur-2xl transition group-hover:scale-110" />
                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[#637089]">{item.title}</p>
                    <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-[#162033]">{item.value}</h3>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#eafbf1] px-3 py-1 text-xs font-semibold text-[#18a957]">
                        <FiArrowUpRight size={14} />{item.change}
                      </span>
                    </div>
                  </div>
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg`}>
                    {item.icon}
                  </div>
                </div>
                <div className="relative z-10 mt-5">
                  <div className="mb-2 flex justify-between text-[11px] font-semibold text-[#718097]">
                    <span>Performance</span><span>{item.progress}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#ecf2f7]">
                    <Motion.div initial={{ width: 0 }} animate={{ width: item.progress }} transition={{ duration: 0.8 }}
                      className={`h-full rounded-full bg-gradient-to-r ${item.line}`} />
                  </div>
                </div>
              </Motion.div>
            ))}
          </Motion.div>
        )}

        {/* Chart + Activity */}
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Bar Chart — Real Monthly Trend */}
          <Motion.div variants={fadeUp} initial="hidden" animate="show" whileHover={{ y: -2 }}
            className="xl:col-span-2 rounded-[30px] border border-[#dbe5ef] bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#162033]">Monthly Lead Trend</h3>
                <p className="text-sm text-[#6b7a90]">Real data — leads acquired per month</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#eef5fb] px-4 py-2 text-xs font-semibold text-[#5c6d83]">
                <FiClock size={13} /> Live from DB
              </div>
            </div>
            <div className="relative h-72">
              <div className="absolute inset-0 flex flex-col justify-between py-2">
                {[maxTrend, Math.round(maxTrend * 0.75), Math.round(maxTrend * 0.5), Math.round(maxTrend * 0.25), 0].map((v) => (
                  <div key={v} className="flex items-center gap-2 text-[10px] font-semibold text-[#8a97ab]">
                    <span className="w-7">{v}</span>
                    <div className="h-px flex-1 border-t border-dashed border-[#d8e5f0]" />
                  </div>
                ))}
              </div>
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-500" />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-end gap-2 px-8 pt-4 pb-2">
                  {trend.map((m, i) => {
                    const h = maxTrend > 0 ? Math.round((m.leads / maxTrend) * 100) : 0;
                    return (
                      <div key={i} className="flex flex-1 flex-col items-center justify-end h-full">
                        <div className="flex-grow w-full flex items-end rounded-[14px] bg-[#e9f0f7] px-1 pb-1">
                          <Motion.div
                            initial={{ height: 0 }} animate={{ height: `${h}%` }}
                            transition={{ duration: 0.7, delay: i * 0.07 }}
                            title={`${m.leads} leads`}
                            className="relative w-full cursor-pointer rounded-t-[14px] bg-gradient-to-t from-[#19c2e6] via-[#35a8f7] to-[#5866ff] shadow-[0_12px_24px_rgba(53,168,247,0.2)]">
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-full bg-[#1c2233] px-2 py-1 text-[10px] font-semibold text-white shadow-md">{m.leads}</span>
                          </Motion.div>
                        </div>
                        <span className="mt-2 text-[10px] font-semibold text-[#61718a]">{m.month}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Motion.div>

          {/* Recent Activity */}
          <Motion.div variants={fadeUp} initial="hidden" animate="show"
            className="rounded-[30px] border border-[#dbe5ef] bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-[#162033]">Recent Activity</h3>
                <p className="mt-1 text-sm text-[#6b7a90]">Live updates from your team</p>
              </div>
              <div className="rounded-2xl bg-[#f3f8fd] p-2 text-[#1eaedb]"><FiFileText size={18} /></div>
            </div>
            <div className="mt-5 space-y-3">
              {loading ? (
                [...Array(4)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100" />)
              ) : activities.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">No recent activity yet.</p>
              ) : (
                activities.slice(0, 6).map((item, index) => (
                  <Motion.div key={index} whileHover={{ x: 4, y: -2 }} transition={{ duration: 0.2 }}
                    className="rounded-[22px] border border-[#e5eef6] bg-gradient-to-r from-[#f8fbff] to-[#f4f9ff] p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-full ${activityColors[item.type] || "bg-slate-100 text-slate-600"}`}>
                        <FiCheckCircle size={16} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-5 text-[#475569] truncate">{item.message}</p>
                        <p className="mt-0.5 text-xs font-semibold text-[#8b98aa]">
                          {new Date(item.time).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Motion.div>
                ))
              )}
            </div>
            <div className="mt-5 rounded-[22px] bg-gradient-to-r from-[#1c2233] via-[#25314d] to-[#1eaedb] p-4 text-white shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">System Status</p>
              <h4 className="mt-2 text-lg font-bold">All systems operational</h4>
              <p className="mt-1 text-sm leading-6 text-slate-200">Database connected · API healthy</p>
            </div>
          </Motion.div>
        </div>

        {/* Quick Access */}
        <Motion.div variants={fadeUp} initial="hidden" animate="show"
          className="mt-6 rounded-[30px] border border-[#dbe5ef] bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#162033]">Quick Access Modules</h3>
              <p className="mt-1 text-sm text-[#6b7a90]">Open important modules quickly</p>
            </div>
            <div className="rounded-full border border-[#d7e5f1] bg-[#f7fbff] px-4 py-2 text-xs font-semibold text-[#5c6d83]">6 modules</div>
          </div>
          <Motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {quickLinks.map((item) => (
              <Motion.div key={item.title} variants={fadeUp} whileHover={{ y: -6, scale: 1.01 }}
                className="group relative overflow-hidden rounded-[24px] border border-[#e1ebf3] bg-gradient-to-b from-white to-[#f8fbff] p-5 transition-all hover:border-[#c9def0] hover:shadow-[0_18px_34px_rgba(34,199,238,0.10)]">
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-cyan-100/30 blur-2xl" />
                <div className="relative z-10">
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${item.light} ${item.text}`}>{item.icon}</div>
                  <h4 className="mt-4 text-lg font-semibold text-[#162033]">{item.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-[#5b6a81]">{item.desc}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <Link to={item.path}
                      className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${item.accent} px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95`}>
                      Open Module <FiArrowUpRight size={16} />
                    </Link>
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#8b98aa]">SmartCRM</span>
                  </div>
                </div>
              </Motion.div>
            ))}
          </Motion.div>
        </Motion.div>

      </div>
    </div>
  );
};

export default AdminDashHome;
