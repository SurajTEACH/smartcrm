import express from "express";
import { isAuth } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getTaskStats,
} from "../controllers/taskController.js";

const taskRouter = express.Router();

taskRouter.post("/create", isAuth, authorizeRoles("admin"), createTask);

taskRouter.get("/get", isAuth, authorizeRoles("admin", "sales"), getTasks);

taskRouter.put(
  "/update/:id",
  isAuth,
  authorizeRoles("admin", "sales"),
  updateTask
);

taskRouter.delete("/delete/:id", isAuth, authorizeRoles("admin"), deleteTask);

taskRouter.get("/stats", isAuth, authorizeRoles("admin", "sales"), getTaskStats);

export default taskRouter;
