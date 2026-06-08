import api from "./axios";

// create user
export const createUser = async (data) => {
  const res = await api.post("/api/auth/register", data);
  return res.data;
};

// get all users
export const getAllUsers = async () => {
  const res = await api.get("/api/users/all-users");
  return res.data;
};

// update user
export const updateUser = async (id, data) => {
  const res = await api.put(`/api/users/update-user/${id}`, data);
  return res.data;
};

// delete user
export const deleteUser = async (id) => {
  const res = await api.delete(`/api/users/delete-user/${id}`);
  return res.data;
};

// user stats
export const getUserStats = async () => {
  const res = await api.get("/api/users/user-status");
  return res.data;
};

// search users
export const searchUsers = async (params = {}) => {
  const cleanedParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
    )
  );

  const res = await api.get("/api/users/user-search", {
    params: cleanedParams,
  });

  return res.data;
};


