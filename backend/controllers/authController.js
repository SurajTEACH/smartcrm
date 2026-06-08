import {
  loginUser,
  logoutUser,
  registerUser,
  updatePasswordService,
  updateProfileService,
  getMyProfile,
} from "../services/authService.js";

export const register = async (req, res) => {
  try {
    const data = await registerUser(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const data = await loginUser(req.body);
    res.status(200).json(data);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    await logoutUser(token);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const result = await updatePasswordService(
      userId,
      oldPassword,
      newPassword,
      confirmPassword
    );

    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await updateProfileService(userId, req.body);
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const myProfile = async (req, res) => {
  try {
    const user = await getMyProfile(req.user._id);
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};