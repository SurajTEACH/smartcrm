import express from "express";
import { isAuth } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  createLead,
  deleteLead,
  getLeads,
  getLeadStats,
  updateLead,
  getLeadsForDropdown,
  getRestoredLeads,
  restoreLead,
  permanentDeleteLead,
} from "../controllers/leadController.js";

const leaadRouter = express.Router();

leaadRouter.post(
  "/create",
  isAuth,
  authorizeRoles("admin", "sales"),
  createLead
);

leaadRouter.get(
  "/get",
  isAuth,
  authorizeRoles("admin", "sales"),
  getLeads
);

leaadRouter.put(
  "/update/:id",
  isAuth,
  authorizeRoles("admin", "sales"),
  updateLead
);

leaadRouter.delete(
  "/delete/:id",
  isAuth,
  authorizeRoles("admin"),
  deleteLead
);

leaadRouter.patch(
  "/restore/:id",
  isAuth,
  authorizeRoles("admin"),
  restoreLead
);

leaadRouter.delete(
  "/permanent-delete/:id",
  isAuth,
  authorizeRoles("admin"),
  permanentDeleteLead
);

leaadRouter.get(
  "/stats",
  isAuth,
  authorizeRoles("admin", "sales"),
  getLeadStats
);

leaadRouter.get(
  "/dropdown",
  isAuth,
  authorizeRoles("admin", "sales"),
  getLeadsForDropdown
);

leaadRouter.get(
  "/restored-Leads",
  isAuth,
  authorizeRoles("admin"),
  getRestoredLeads
);

export default leaadRouter;
