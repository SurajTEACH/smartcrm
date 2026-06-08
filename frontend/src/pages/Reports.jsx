import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import {
  FiBarChart2, FiTarget, FiUsers, FiTrendingUp,
  FiCheckSquare, FiRefreshCw, FiAlertCircle, FiAward,
} from "react-icons/fi";
import {
  getDashboardStatsApi,
  getMonthlyTrendApi,
  getLeadFunnelApi,
  getTopPerformersApi,
} from "../api/Analytics.js";

const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

const funnelColors = {
  New: "bg-blue-500", Contacted: "bg-amber-500",
  Interested: "bg-emerald-500", Not_Interested: "bg-rose-500", Converted: "bg-violet-500",
};
const funnelBg = {
  New: "bg-blue-50 text-blue-700 border-blue-200",
  Contacted: "bg-amber-50 text-amber-700 border-amber-200",
  Interested: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Not_Interested: "bg-rose-50 text-rose-700 border-rose-200",
  Converted: "bg-violet-50 text-violet-700 border-violet-200",
};

const Reports = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "admin";

  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [funnel, setFunnel] = useState([]);
  const [performers, setPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const calls = [getDashboardStatsApi(), getMonthlyTrendApi(), getLeadFunnelApi()];
      if (isAdmin) calls.push(getTopPerformersApi());
      const results = await Promise.all(calls);
      setStats(results[0].data.stats);
      setTrend(results[1].data.trend || []);
      setFunnel(results[2].data.funnel || []);
      if (isAdmin && results[3]) setPerformers(results[3].data.performers || []);
    } catch { setError("Failed to load reports. Please retry."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const maxLeads = Math.max(...trend.map((m) => m.leads || 0), 1);
  const maxConversions = Math.max(...trend.map((m) => m.conversions || 0), 1);

  const overviewCards = stats ? [
    { title: "Total Leads", value: stats.overview.totalLeads, sub: `${stats.thisMonth.newLeads} this month`, icon: <FiTarget size={20} />, color: "from-violet-500 to-indigo-500" },
    { title: "Total Customers", value: stats.overview.totalCustomers, sub: `${stats.thisMonth.newCustomers} this month`, icon: <FiUsers size={20} />, color: "from-cyan-500 to-sky-500" },
    { title: "Conversion Rate", value: `${stats.overview.conversionRate}%`, sub: "Lead → Customer", icon: <FiTrendingUp size={20} />, color: "from-emerald-500 to-teal-500" },
    { title: "Tasks Completed", value: stats.overview.completedTasks, sub: `${stats.overview.pendingTasks} pending`, icon: <FiCheckSquare size={20} />, color: "from-amber-500 to-orange-500" },
  ] : [];

  return (
    <div className="min-h-full bg-white text-slate-900">
      <div className="mx-auto max-w-[1600px]">

        {/* Header */}
        <Motion.div variants={fadeUp} initial="hidden" animate="show"
          className="relative mb-6 overflow-hidden rounded-[30px] border border-slate-200 bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 px-6 py-7 shadow-xl text-white">
          <div className="pointer-events-none absolute left-0 top-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute right-0 bottom-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-cyan-300">
                <FiBarChart2 size={13} /> Reports & Analytics
              </div>
              <h1 className="text-2xl font-extrabold sm:text-3xl">Business Intelligence</h1>
              <p className="mt-2 text-sm text-slate-300">Real-time analytics powered by your live database.</p>
            </div>
            <button onClick={fetchData} disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-cyan-600 disabled:opacity-60">
              <FiRefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh Reports
            </button>
          </div>
        </Motion.div>

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700">
            <FiAlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
            <button onClick={fetchData} className="ml-auto rounded-xl bg-rose-100 px-3 py-1 text-xs font-semibold hover:bg-rose-200">Retry</button>
          </div>
        )}

        {/* Overview KPIs */}
        <Motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading ? [...Array(4)].map((_, i) => <div key={i} className="h-32 animate-pulse rounded-[24px] bg-slate-100" />) :
            overviewCards.map((card) => (
              <Motion.div key={card.title} variants={fadeUp} whileHover={{ y: -5 }}
                className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg transition">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-md mb-4`}>{card.icon}</div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <h3 className="mt-1 text-3xl font-extrabold text-slate-900">{card.value}</h3>
                <p className="mt-1 text-xs text-slate-400">{card.sub}</p>
              </Motion.div>
            ))}
        </Motion.div>

        {/* Monthly Trend Chart */}
        <Motion.div variants={fadeUp} initial="hidden" animate="show"
          className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Monthly Trend — Last 8 Months</h3>
              <p className="text-sm text-slate-500">Leads acquired vs conversions per month</p>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 inline-block" />Leads</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 inline-block" />Conversions</span>
            </div>
          </div>
          {loading ? <div className="h-64 animate-pulse rounded-2xl bg-slate-100" /> : (
            <div className="relative h-72">
              <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
                {[maxLeads, Math.round(maxLeads * 0.75), Math.round(maxLeads * 0.5), Math.round(maxLeads * 0.25), 0].map((v) => (
                  <div key={v} className="flex items-center gap-2 text-[10px] font-semibold text-slate-400">
                    <span className="w-6 text-right">{v}</span>
                    <div className="h-px flex-1 border-t border-dashed border-slate-200" />
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 flex items-end gap-2 px-8 pt-4 pb-2">
                {trend.map((m, i) => {
                  const lh = maxLeads > 0 ? Math.round((m.leads / maxLeads) * 100) : 0;
                  const ch = maxLeads > 0 ? Math.round(((m.conversions || 0) / maxLeads) * 100) : 0;
                  return (
                    <div key={i} className="flex flex-1 flex-col items-center justify-end h-full">
                      <div className="flex w-full items-end justify-center gap-1 flex-grow">
                        {/* Leads bar */}
                        <div className="flex-1 flex items-end h-full rounded-t-[8px] bg-slate-100">
                          <Motion.div initial={{ height: 0 }} animate={{ height: `${lh}%` }} transition={{ duration: 0.7, delay: i * 0.07 }}
                            title={`${m.leads} leads`}
                            className="w-full rounded-t-[8px] bg-gradient-to-t from-cyan-500 to-indigo-500 cursor-pointer" style={{ minHeight: m.leads > 0 ? 4 : 0 }} />
                        </div>
                        {/* Conversions bar */}
                        <div className="flex-1 flex items-end h-full rounded-t-[8px] bg-slate-100">
                          <Motion.div initial={{ height: 0 }} animate={{ height: `${ch}%` }} transition={{ duration: 0.7, delay: i * 0.07 + 0.1 }}
                            title={`${m.conversions} conversions`}
                            className="w-full rounded-t-[8px] bg-gradient-to-t from-emerald-500 to-teal-500 cursor-pointer" style={{ minHeight: m.conversions > 0 ? 4 : 0 }} />
                        </div>
                      </div>
                      <span className="mt-2 text-[10px] font-semibold text-slate-500">{m.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Motion.div>

        {/* Funnel + Performers */}
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Lead Funnel */}
          <Motion.div variants={fadeUp} initial="hidden" animate="show"
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-1">Lead Status Funnel</h3>
            <p className="text-sm text-slate-500 mb-6">Distribution of leads by stage</p>
            {loading ? [...Array(5)].map((_, i) => <div key={i} className="mb-4 h-10 animate-pulse rounded-xl bg-slate-100" />) :
              funnel.map((item) => (
                <div key={item.status} className="mb-5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${funnelBg[item.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                      {item.status.replace("_", " ")}
                    </span>
                    <span className="text-sm font-bold text-slate-700">{item.count} <span className="font-normal text-slate-400">({item.percentage}%)</span></span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <Motion.div initial={{ width: 0 }} animate={{ width: `${item.percentage}%` }} transition={{ duration: 0.7 }}
                      className={`h-full rounded-full ${funnelColors[item.status] || "bg-slate-400"}`} />
                  </div>
                </div>
              ))}
          </Motion.div>

          {/* Top Performers (admin only) */}
          {isAdmin && (
            <Motion.div variants={fadeUp} initial="hidden" animate="show"
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <FiAward size={22} className="text-amber-500" />
                <h3 className="text-xl font-bold text-slate-900">Top Performers</h3>
              </div>
              <p className="text-sm text-slate-500 mb-6">Sales agents ranked by lead conversions</p>
              {loading ? [...Array(5)].map((_, i) => <div key={i} className="mb-3 h-14 animate-pulse rounded-2xl bg-slate-100" />) :
                performers.length === 0 ? <p className="py-8 text-center text-sm text-slate-400">No data yet.</p> :
                  performers.map((p, i) => (
                    <div key={i} className="mb-3 flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white font-bold text-sm shadow-md ${i === 0 ? "bg-gradient-to-br from-amber-400 to-orange-500" : i === 1 ? "bg-gradient-to-br from-slate-400 to-slate-600" : "bg-gradient-to-br from-orange-400 to-red-500"}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.totalLeads} leads · {p.converted} converted · {p.conversionRate}% rate</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{p.converted} ✓</span>
                    </div>
                  ))}
            </Motion.div>
          )}

          {/* For sales users — show summary card instead */}
          {!isAdmin && (
            <Motion.div variants={fadeUp} initial="hidden" animate="show"
              className="rounded-[28px] border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">Your Performance Summary</h3>
              <p className="text-sm text-slate-500 mt-1 mb-6">Personal stats from your assigned leads</p>
              {stats && (
                <div className="space-y-4">
                  {[
                    { label: "Total My Leads", value: stats.myStats.myLeads, color: "text-violet-700" },
                    { label: "My Conversions", value: stats.myStats.myConversions, color: "text-emerald-700" },
                    { label: "My Active Tasks", value: stats.myStats.myTasks, color: "text-amber-700" },
                    { label: "My Conv. Rate", value: stats.myStats.myLeads > 0 ? `${((stats.myStats.myConversions / stats.myStats.myLeads) * 100).toFixed(1)}%` : "0%", color: "text-cyan-700" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
                      <span className="text-sm font-medium text-slate-600">{item.label}</span>
                      <span className={`text-xl font-extrabold ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </Motion.div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Reports;
