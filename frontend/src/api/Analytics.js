import api from "./axios.js";

export const getDashboardStatsApi = () =>
  api.get("/api/analytics/dashboard");

export const getMonthlyTrendApi = () =>
  api.get("/api/analytics/monthly-trend");

export const getLeadFunnelApi = () =>
  api.get("/api/analytics/lead-funnel");

export const getTopPerformersApi = () =>
  api.get("/api/analytics/top-performers");

export const getRecentActivitiesApi = () =>
  api.get("/api/analytics/recent-activities");
