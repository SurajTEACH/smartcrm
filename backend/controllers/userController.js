import {
  countAdmin,
  countSales,
  deleteUser,
  filterUsers,
  getAllUsers,
  totalUsers,
  updateUser,
  usersCurrentMonth,
} from "../services/userService.js";

const successResponse = (res, message, data = {}) => {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

// get all users
export const getByAllUsers = async (req, res) => {
  try {
    const users = await getAllUsers();

    return successResponse(res, "Users fetched successfully", { users });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// update user
export const updateByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const updatedUser = await updateUser(userId, req.body);

    return successResponse(res, "User updated successfully", {
      user: updatedUser,
    });
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

// delete user
export const deleteByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await deleteUser(userId);

    return successResponse(res, result.message);
  } catch (error) {
    return errorResponse(res, 404, error.message);
  }
};

// dashboard stats
export const getUserStats = async (req, res) => {
  try {
    const [admins, sales, total, monthlyAdded] = await Promise.all([
      countAdmin(),
      countSales(),
      totalUsers(),
      usersCurrentMonth(),
    ]);

    return successResponse(res, "Stats fetched successfully", {
      admins,
      sales,
      totalUsers: total,
      monthlyAdded,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// search users
export const searchUsers = async (req, res) => {
  try {
    const users = await filterUsers(req.query);

    return successResponse(res, "Users fetched successfully", { users });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};


export const getUsersForDropdown = async (req, res) => {
  try {
    const users = await User.find({})
      .select("_id name email role")
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};