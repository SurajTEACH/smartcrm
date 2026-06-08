import bcrypt from "bcryptjs";
import User from "../models/User.js";

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeRoleValue = (role = "") => {
  const value = String(role).toLowerCase().trim();

  if (value.includes("admin")) return "admin";
  if (value.includes("sale")) return "sales";

  return value || "sales";
};

// get all users
export const getAllUsers = async () => {
  return await User.find().select("-password").sort({ createdAt: -1 });
};

// update user
export const updateUser = async (id, data) => {
  const { name, email, role, password } = data;

  const updateFields = {};

  if (name && name.trim()) updateFields.name = name.trim();

  if (email && email.trim()) {
    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
      _id: { $ne: id },
    });

    if (existingUser) {
      throw new Error("Email already exists");
    }

    updateFields.email = email.trim().toLowerCase();
  }

  if (role && role.trim()) {
    updateFields.role = normalizeRoleValue(role);
  }

  if (password && password.trim()) {
    const salt = await bcrypt.genSalt(12);
    updateFields.password = await bcrypt.hash(password.trim(), salt);
  }

  const user = await User.findByIdAndUpdate(
    id,
    { $set: updateFields },
    {
      new: true,
      runValidators: true,
    }
  ).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// delete user
export const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new Error("User not found");
  }

  return { message: "User deleted successfully" };
};

// count admin
export const countAdmin = async () => {
  return await User.countDocuments({
    role: { $regex: "admin", $options: "i" },
  });
};

// count sales
export const countSales = async () => {
  return await User.countDocuments({
    role: { $regex: "sale", $options: "i" },
  });
};

// total users
export const totalUsers = async () => {
  return await User.countDocuments();
};

// users added in current month
export const usersCurrentMonth = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return await User.countDocuments({
    createdAt: {
      $gte: startOfMonth,
      $lte: now,
    },
  });
};

// filter users by name/email/role
export const filterUsers = async (query = {}) => {
  const { name = "", email = "", role = "" } = query;

  const filter = {};
  const orConditions = [];

  if (name.trim()) {
    orConditions.push({
      name: { $regex: escapeRegex(name.trim()), $options: "i" },
    });
  }

  if (email.trim()) {
    orConditions.push({
      email: { $regex: escapeRegex(email.trim()), $options: "i" },
    });
  }

  if (orConditions.length > 0) {
    filter.$or = orConditions;
  }

  if (role.trim()) {
    const normalizedRole = normalizeRoleValue(role);
    filter.role = { $regex: normalizedRole, $options: "i" };
  }

  return await User.find(filter).select("-password").sort({ createdAt: -1 });
};
