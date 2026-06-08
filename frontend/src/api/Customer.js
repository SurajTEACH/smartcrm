import api from "./axios";

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("accessToken") ||
  localStorage.getItem("smartcrm_token") ||
  "";

const getAuthConfig = () => {
  const token = getToken();

  return {
    withCredentials: true,
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  };
};

// GET: /api/customers/get-customers
export const getAllCustomers = async () => {
  const { data } = await api.get(
    "/api/customers/get-customers",
    getAuthConfig()
  );
  return data;
};

// POST: /api/customers/create-customer
export const createCustomer = async (customerData) => {
  const { data } = await api.post(
    "/api/customers/create-customer",
    customerData,
    getAuthConfig()
  );
  return data;
};

// PUT: /api/customers/update-customer/:id
export const updateCustomer = async (id, customerData) => {
  const { data } = await api.put(
    `/api/customers/update-customer/${id}`,
    customerData,
    getAuthConfig()
  );
  return data;
};

// DELETE: /api/customers/delete-customer/:id
export const deleteCustomer = async (id) => {
  const { data } = await api.delete(
    `/api/customers/delete-customer/${id}`,
    getAuthConfig()
  );
  return data;
};

// GET: /api/customers/customer-status
export const getCustomerStatus = async () => {
  const { data } = await api.get(
    "/api/customers/customer-status",
    getAuthConfig()
  );
  return data;
};
