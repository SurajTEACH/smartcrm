import api from "./axios";

export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/api/auth/login", credentials);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || "Login failed. Please try again";

    throw message; 
  }
};


export const logoutUser = async () => {
  try {
    const response = await api.post("/api/auth/logout");
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || "Logout failed. Please try again";

    throw message;
  }
};

export const updatePaaword  = async (passwordData) => {
     try {
       const response = await api.post("/api/auth/change-password", passwordData);
        return response.data;
     } catch (error) {
       const message =
         error.response?.data?.message || "Failed to update password. Please try again";

       throw message;
     }
}