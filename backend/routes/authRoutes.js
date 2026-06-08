import express from "express";
import {
  login,
  logout,
  register,
  updatePassword,
  updateProfile,
  myProfile,
} from "../controllers/authController.js";
import { isAuth } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", isAuth, logout);
authRouter.post("/change-password", isAuth, updatePassword);
authRouter.put("/update-profile", isAuth, updateProfile);
authRouter.get("/me", isAuth, myProfile);

authRouter.get("/admin", isAuth, authorizeRoles("admin"), (req, res) => {
  res.status(200).json({ message: "Admin route" });
});

export default authRouter;