import express from "express";
import {
  deleteByUser,
  getByAllUsers,
  getUserStats,
  searchUsers,
  updateByUser,
  getUsersForDropdown,
} from "../controllers/userController.js";
import { isAuth } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const userRouter = express.Router();

userRouter.get("/all-users", isAuth, authorizeRoles("admin", "sales"), getByAllUsers);

userRouter.put(
  "/update-user/:id",
  isAuth,
  authorizeRoles("admin"),
  updateByUser
);

userRouter.delete(
  "/delete-user/:id",
  isAuth,
  authorizeRoles("admin"),
  deleteByUser
);

userRouter.get(
  "/dropdown",
  isAuth,
  authorizeRoles("admin"),
  getUsersForDropdown
);

userRouter.get("/user-status", isAuth, authorizeRoles("admin"), getUserStats);

userRouter.get("/user-search", isAuth, authorizeRoles("admin"), searchUsers);

export default userRouter;
