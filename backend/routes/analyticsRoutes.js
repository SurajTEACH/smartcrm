import express from "express";
import {
  dashboardStats,
  monthlyTrend,
  leadFunnel,
  topPerformers,
  recentActivities,
} from "../controllers/analyticsController.js";
import { isAuth } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const analyticsRouter = express.Router();

// All analytics routes require authentication
analyticsRouter.get("/dashboard", isAuth, dashboardStats);
analyticsRouter.get("/monthly-trend", isAuth, monthlyTrend);
analyticsRouter.get("/lead-funnel", isAuth, leadFunnel);
analyticsRouter.get("/top-performers", isAuth, authorizeRoles("admin"), topPerformers);
analyticsRouter.get("/recent-activities", isAuth, recentActivities);

export default analyticsRouter;
