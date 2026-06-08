import Lead from "../models/Lead.js";
import Customer from "../models/Customer.js";
import User from "../models/User.js";
import Task from "../models/Task.js";

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────
export const getDashboardStats = async (user) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Parallel DB queries for performance
  const [
    totalUsers,
    totalCustomers,
    totalLeads,
    totalTasks,
    newLeadsThisMonth,
    newLeadsLastMonth,
    convertedLeadsThisMonth,
    convertedLeadsLastMonth,
    newCustomersThisMonth,
    newCustomersLastMonth,
    pendingTasks,
    completedTasks,
    myLeads,
    myConversions,
    myTasks,
  ] = await Promise.all([
    User.countDocuments(),
    Customer.countDocuments({ isDeleted: false }),
    Lead.countDocuments({ isDeleted: false }),
    Task.countDocuments({ isDeleted: false }),
    Lead.countDocuments({
      isDeleted: false,
      createdAt: { $gte: startOfMonth },
    }),
    Lead.countDocuments({
      isDeleted: false,
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    }),
    Lead.countDocuments({
      isDeleted: false,
      status: "Converted",
      createdAt: { $gte: startOfMonth },
    }),
    Lead.countDocuments({
      isDeleted: false,
      status: "Converted",
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    }),
    Customer.countDocuments({
      isDeleted: false,
      createdAt: { $gte: startOfMonth },
    }),
    Customer.countDocuments({
      isDeleted: false,
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    }),
    Task.countDocuments({ isDeleted: false, status: "Pending" }),
    Task.countDocuments({ isDeleted: false, status: "Completed" }),
    // sales-specific
    Lead.countDocuments({ isDeleted: false, assignedTo: user._id }),
    Lead.countDocuments({
      isDeleted: false,
      assignedTo: user._id,
      status: "Converted",
    }),
    Task.countDocuments({ isDeleted: false, assignedTo: user._id }),
  ]);

  const conversionRate =
    totalLeads > 0
      ? ((Lead.countDocuments({ status: "Converted", isDeleted: false }) /
          totalLeads) *
          100).toFixed(1)
      : 0;

  // Growth percentages
  const leadsGrowth =
    newLeadsLastMonth > 0
      ? (((newLeadsThisMonth - newLeadsLastMonth) / newLeadsLastMonth) * 100).toFixed(1)
      : newLeadsThisMonth > 0
      ? 100
      : 0;

  const customersGrowth =
    newCustomersLastMonth > 0
      ? (((newCustomersThisMonth - newCustomersLastMonth) / newCustomersLastMonth) * 100).toFixed(1)
      : newCustomersThisMonth > 0
      ? 100
      : 0;

  const conversionGrowth =
    convertedLeadsLastMonth > 0
      ? (((convertedLeadsThisMonth - convertedLeadsLastMonth) / convertedLeadsLastMonth) * 100).toFixed(1)
      : convertedLeadsThisMonth > 0
      ? 100
      : 0;

  // Conversion rate (accurate)
  const actualConversionRate =
    totalLeads > 0
      ? (((await Lead.countDocuments({ status: "Converted", isDeleted: false })) / totalLeads) * 100).toFixed(1)
      : 0;

  return {
    overview: {
      totalUsers,
      totalCustomers,
      totalLeads,
      totalTasks,
      pendingTasks,
      completedTasks,
      conversionRate: actualConversionRate,
    },
    thisMonth: {
      newLeads: newLeadsThisMonth,
      newCustomers: newCustomersThisMonth,
      convertedLeads: convertedLeadsThisMonth,
      leadsGrowth: Number(leadsGrowth),
      customersGrowth: Number(customersGrowth),
      conversionGrowth: Number(conversionGrowth),
    },
    myStats: {
      myLeads,
      myConversions,
      myTasks,
    },
  };
};

// ─── Monthly Trend (last 8 months) ───────────────────────────────────────────
export const getMonthlyTrend = async () => {
  const months = [];
  const now = new Date();

  for (let i = 7; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const [leads, customers, conversions] = await Promise.all([
      Lead.countDocuments({
        isDeleted: false,
        createdAt: { $gte: start, $lte: end },
      }),
      Customer.countDocuments({
        isDeleted: false,
        createdAt: { $gte: start, $lte: end },
      }),
      Lead.countDocuments({
        isDeleted: false,
        status: "Converted",
        createdAt: { $gte: start, $lte: end },
      }),
    ]);

    months.push({
      month: start.toLocaleString("default", { month: "short" }),
      year: start.getFullYear(),
      leads,
      customers,
      conversions,
    });
  }

  return months;
};

// ─── Lead Funnel (status breakdown) ──────────────────────────────────────────
export const getLeadFunnel = async (user) => {
  const matchQuery = { isDeleted: false };
  if (user.role === "sales") {
    matchQuery.assignedTo = user._id;
  }

  const statuses = ["New", "Contacted", "Interested", "Not_Interested", "Converted"];

  const results = await Promise.all(
    statuses.map(async (status) => ({
      status,
      count: await Lead.countDocuments({ ...matchQuery, status }),
    }))
  );

  const total = results.reduce((acc, r) => acc + r.count, 0);

  return results.map((r) => ({
    ...r,
    percentage: total > 0 ? ((r.count / total) * 100).toFixed(1) : 0,
  }));
};

// ─── Top Performers (admin only) ─────────────────────────────────────────────
export const getTopPerformers = async () => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const performers = await Lead.aggregate([
    {
      $match: {
        isDeleted: false,
        assignedTo: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: "$assignedTo",
        totalLeads: { $sum: 1 },
        converted: {
          $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] },
        },
        thisMonth: {
          $sum: {
            $cond: [{ $gte: ["$createdAt", startOfMonth] }, 1, 0],
          },
        },
      },
    },
    { $sort: { converted: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 0,
        name: "$user.name",
        email: "$user.email",
        role: "$user.role",
        totalLeads: 1,
        converted: 1,
        thisMonth: 1,
        conversionRate: {
          $cond: [
            { $eq: ["$totalLeads", 0] },
            0,
            {
              $round: [
                { $multiply: [{ $divide: ["$converted", "$totalLeads"] }, 100] },
                1,
              ],
            },
          ],
        },
      },
    },
  ]);

  return performers;
};

// ─── Recent Activities ────────────────────────────────────────────────────────
export const getRecentActivities = async (user) => {
  const matchQuery = { isDeleted: false };
  if (user.role === "sales") {
    matchQuery.assignedTo = user._id;
  }

  const [recentLeads, recentCustomers, recentTasks] = await Promise.all([
    Lead.find(matchQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name status source createdByName createdAt"),
    Customer.find(user.role === "admin" ? { isDeleted: false } : { isDeleted: false, createdBy: user._id })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("name email createdByName createdAt"),
    Task.find(
      user.role === "admin"
        ? { isDeleted: false }
        : { isDeleted: false, assignedTo: user._id }
    )
      .sort({ createdAt: -1 })
      .limit(3)
      .select("title status priority createdByName createdAt"),
  ]);

  const activities = [
    ...recentLeads.map((l) => ({
      type: "lead",
      message: `Lead "${l.name}" added (${l.status})`,
      by: l.createdByName || "Unknown",
      time: l.createdAt,
      color: "cyan",
    })),
    ...recentCustomers.map((c) => ({
      type: "customer",
      message: `Customer "${c.name}" converted`,
      by: c.createdByName || "Unknown",
      time: c.createdAt,
      color: "emerald",
    })),
    ...recentTasks.map((t) => ({
      type: "task",
      message: `Task "${t.title}" — ${t.status}`,
      by: t.createdByName || "Unknown",
      time: t.createdAt,
      color: "violet",
    })),
  ];

  return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);
};
