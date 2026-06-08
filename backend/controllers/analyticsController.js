import {
  getDashboardStats,
  getMonthlyTrend,
  getLeadFunnel,
  getTopPerformers,
  getRecentActivities,
} from "../services/analyticsService.js";

// GET /api/analytics/dashboard
export const dashboardStats = async (req, res) => {
  try {
    const stats = await getDashboardStats(req.user);
    res.status(200).json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/analytics/monthly-trend
export const monthlyTrend = async (req, res) => {
  try {
    const trend = await getMonthlyTrend();
    res.status(200).json({ success: true, trend });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/analytics/lead-funnel
export const leadFunnel = async (req, res) => {
  try {
    const funnel = await getLeadFunnel(req.user);
    res.status(200).json({ success: true, funnel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/analytics/top-performers (admin only)
export const topPerformers = async (req, res) => {
  try {
    const performers = await getTopPerformers();
    res.status(200).json({ success: true, performers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/analytics/recent-activities
export const recentActivities = async (req, res) => {
  try {
    const activities = await getRecentActivities(req.user);
    res.status(200).json({ success: true, activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
