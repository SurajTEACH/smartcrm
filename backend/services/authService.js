import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Blacklist from "../models/Blacklist.js";
import { generateToken } from "../utils/generateToken.js";

export const registerUser = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("User already exists");

  const hashed = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    password: hashed,
    role: role || "sales",
  });

  user.password = undefined;

  return { message: "Registered successfully", user };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid email or password");
  }

  // Update lastLogin
  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user);
  user.password = undefined;

  return { message: "Login successful", user, token };
};

export const logoutUser = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  await Blacklist.create({
    token,
    expiresAt: new Date(decoded.exp * 1000),
  });

  return { message: "Logout successful" };
};

export const updatePasswordService = async (
  userId,
  currentPassword,
  newPassword,
  confirmPassword
) => {
  const user = await User.findById(userId);

  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error("Current password is incorrect");

  if (newPassword !== confirmPassword) throw new Error("Passwords do not match");

  const isSame = await bcrypt.compare(newPassword, user.password);
  if (isSame) throw new Error("New password cannot be same as old password");

  if (newPassword.length < 6)
    throw new Error("Password must be at least 6 characters long");

  const hashed = await bcrypt.hash(newPassword, 12);
  user.password = hashed;
  await user.save();

  return { message: "Password updated successfully" };
};

export const updateProfileService = async (userId, data) => {
  const { name, phone, department } = data;

  const updateFields = {};
  if (name?.trim()) updateFields.name = name.trim();
  if (phone !== undefined) updateFields.phone = phone.trim();
  if (department !== undefined) updateFields.department = department.trim();

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) throw new Error("User not found");
  return user;
};

export const getMyProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new Error("User not found");
  return user;
};