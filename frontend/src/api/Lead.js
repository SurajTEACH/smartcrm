import api from "./axios.js";

// ==============================
// Lead APIs
// ==============================

export const getLeadsApi = async () => {
  const response = await api.get("/api/leads/get");
  return response.data;
};

export const createLeadApi = async (leadData) => {
  const response = await api.post("/api/leads/create", leadData);
  return response.data;
};

export const updateLeadApi = async (id, leadData) => {
  const response = await api.put(`/api/leads/update/${id}`, leadData);
  return response.data;
};

// soft delete
export const deleteLeadApi = async (id) => {
  const response = await api.delete(`/api/leads/delete/${id}`);
  return response.data;
};

export const getLeadStatsApi = async () => {
  const response = await api.get("/api/leads/stats");
  return response.data;
};

// ==============================
// Users API for Assign Dropdown
// ==============================
export const getUsersApi = async () => {
  try {
    const response = await api.get("/api/users/all-users");
    const users = response?.data?.data?.users || [];

    if (!Array.isArray(users)) {
      throw new Error("Invalid users response format");
    }

    return users.filter(
      (user) => user.role === "admin" || user.role === "sales"
    );
  } catch (error) {
    console.error("getUsersApi error:", error?.response?.data || error.message);
    throw new Error(
      error?.response?.data?.message || "Failed to fetch users"
    );
  }
};

// deleted leads list
export const getRestoredLead = async () => {
  const response = await api.get("/api/leads/restored-Leads");
  return response.data;
};

// restore deleted lead
export const restoreLeadApi = async (id) => {
  const response = await api.patch(`/api/leads/restore/${id}`);
  return response.data;
};

// permanent delete
export const permanentDeleteLeadApi = async (id) => {
  const response = await api.delete(`/api/leads/permanent-delete/${id}`);
  return response.data;
};
