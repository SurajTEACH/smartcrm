import api from "./axios";

export const createTaskApi = async (taskData) => {
  const response = await api.post("/api/tasks/create", taskData);
  return response.data;
};

export const getTasksApi = async () => {
  const response = await api.get("/api/tasks/get");
  return response.data;
};

export const updateTaskApi = async (id, taskData) => {
  const response = await api.put(`/api/tasks/update/${id}`, taskData);
  return response.data;
};

export const deleteTaskApi = async (id) => {
  const response = await api.delete(`/api/tasks/delete/${id}`);
  return response.data;
};

export const getTaskStatsApi = async () => {
  const response = await api.get("/api/tasks/stats");
  return response.data;
};

export const getUsersDropdownApi = async () => {
  const response = await api.get("/api/users/dropdown");
  return response.data;
};

export const getLeadsDropdownApi = async () => {
  const response = await api.get("/api/leads/dropdown");
  return response.data;
};

export const getCustomersDropdownApi = async () => {
  const response = await api.get("/api/customers/dropdown");
  return response.data;
};
