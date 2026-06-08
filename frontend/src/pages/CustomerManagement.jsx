import React, { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  createCustomer,
  deleteCustomer,
  getAllCustomers,
  getCustomerStatus,
  updateCustomer,
} from "../api/Customer";

const initialForm = {
  name: "",
  email: "",
  phone: "",
};

const getStoredUser = () => {
  try {
    return (
      JSON.parse(localStorage.getItem("user") || "null") ||
      JSON.parse(localStorage.getItem("smartcrm_user") || "null") ||
      null
    );
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return null;
  }
};

const getErrorMessage = (error, fallback = "Something went wrong") => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return fallback;
};

const Modal = ({
  open,
  title,
  subtitle,
  onClose,
  children,
  maxWidth = "max-w-xl",
}) => {
  useEffect(() => {
    if (!open) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = oldOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-[28px] bg-white shadow-2xl`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">{title}</h3>
            {subtitle ? (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            ) : null}
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
      </div>
    </div>
  );
};

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [searchTerm, setSearchTerm] = useState("");

  const [tableLoading, setTableLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editFormData, setEditFormData] = useState(initialForm);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [stats, setStats] = useState({
    totalCustomers: 0,
    getMonthlyCustomers: 0,
  });

  const currentUser = useMemo(() => getStoredUser(), []);
  const currentUserRole = currentUser?.role || "";

  const fetchCustomers = async () => {
    try {
      setTableLoading(true);
      const data = await getAllCustomers();
      const customerList = Array.isArray(data) ? data : data?.customers || [];
      setCustomers(customerList);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to fetch customers"));
    } finally {
      setTableLoading(false);
    }
  };

  const fetchCustomerStats = async () => {
    try {
      setStatsLoading(true);
      const data = await getCustomerStatus();

      setStats({
        totalCustomers: data?.totalCustomers || 0,
        getMonthlyCustomers:
          data?.getMonthlyCustomers || data?.monthlyCustomers || 0,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to fetch customer statistics"));
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchAllData = async () => {
    await Promise.all([fetchCustomers(), fetchCustomerStats()]);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;

    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetCreateForm = () => {
    setFormData(initialForm);
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return toast.error("Customer name is required");
    }

    if (!formData.email.trim()) {
      return toast.error("Customer email is required");
    }

    try {
      setCreateLoading(true);

      await createCustomer({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });

      toast.success("Customer created successfully");
      resetCreateForm();
      await fetchAllData();
    } catch (error) {
      const message = getErrorMessage(error, "Failed to create customer");

      if (
        message.toLowerCase().includes("duplicate key") ||
        message.toLowerCase().includes("already exists")
      ) {
        toast.error("This email already exists");
      } else {
        toast.error(message);
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setEditFormData({
      name: customer?.name || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
    });
  };

  const closeEditModal = () => {
    setEditingCustomer(null);
    setEditFormData(initialForm);
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();

    if (!editFormData.name.trim()) {
      return toast.error("Customer name is required");
    }

    if (!editFormData.email.trim()) {
      return toast.error("Customer email is required");
    }

    if (!editingCustomer?._id) {
      return toast.error("Customer ID is missing");
    }

    try {
      setEditLoading(true);

      await updateCustomer(editingCustomer._id, {
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        phone: editFormData.phone.trim(),
      });

      toast.success("Customer updated successfully");
      closeEditModal();
      await fetchAllData();
    } catch (error) {
      const message = getErrorMessage(error, "Failed to update customer");

      if (
        message.toLowerCase().includes("duplicate key") ||
        message.toLowerCase().includes("already exists")
      ) {
        toast.error("This email already exists");
      } else {
        toast.error(message);
      }
    } finally {
      setEditLoading(false);
    }
  };

  const openDeleteModal = (customer) => {
    setDeleteTarget(customer);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
  };

  const handleDeleteCustomer = async () => {
    if (!deleteTarget?._id) {
      return toast.error("Customer ID is missing");
    }

    try {
      setDeleteLoading(true);
      await deleteCustomer(deleteTarget._id);
      toast.success("Customer deleted successfully");
      closeDeleteModal();
      await fetchAllData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete customer"));
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();

    return customers.filter((customer) => {
      return (
        (customer?.name || "").toLowerCase().includes(q) ||
        (customer?.email || "").toLowerCase().includes(q) ||
        (customer?.phone || "").toLowerCase().includes(q) ||
        (customer?.createdByName || "").toLowerCase().includes(q) ||
        (customer?.createdByRole || "").toLowerCase().includes(q)
      );
    });
  }, [customers, searchTerm]);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const monthlyCount = stats.getMonthlyCustomers || 0;

  // Visual activity indicator only — not a hard limit
  const progressPercentage = useMemo(() => {
    if (monthlyCount <= 0) return 0;
    if (monthlyCount === 1) return 18;
    if (monthlyCount <= 5) return 18 + monthlyCount * 8;
    if (monthlyCount <= 10) return 50 + (monthlyCount - 5) * 4;
    if (monthlyCount <= 25) return 70 + Math.floor((monthlyCount - 10) * 1.2);
    if (monthlyCount <= 50) return 88 + Math.floor((monthlyCount - 25) * 0.4);
    return 100;
  }, [monthlyCount]);

  const activityLabel = useMemo(() => {
    if (monthlyCount === 0) return "No customer activity yet";
    if (monthlyCount <= 5) return "Getting started";
    if (monthlyCount <= 15) return "Healthy activity";
    if (monthlyCount <= 30) return "Strong monthly growth";
    return "High customer acquisition";
  }, [monthlyCount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 px-4 py-6 sm:px-6 lg:px-10">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="mx-auto max-w-7xl space-y-8">
        {/* Hero Section */}
        <div className="rounded-[32px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] sm:p-8 lg:p-10">
          <div className="mb-5 inline-flex rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-sky-600">
            SmartCRM Customer Management
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-4xl">
              <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Customer Operations Dashboard
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500 sm:text-base lg:text-lg">
                Create, search, update, and manage customer records from one
                responsive and modern workspace with role-based access.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
                  Responsive layout
                </span>
                <span className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
                  Professional edit modal
                </span>
                <span className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
                  Secure delete confirmation
                </span>
              </div>
            </div>

            <div className="grid w-full max-w-sm grid-cols-2 gap-4">
              <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
                <p className="text-sm font-semibold text-slate-500">
                  Total Customers
                </p>
                <h3 className="mt-2 text-3xl font-extrabold text-slate-900">
                  {statsLoading ? "..." : stats.totalCustomers}
                </h3>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-slate-500">
                  Added This Month
                </p>
                <h3 className="mt-2 text-3xl font-extrabold text-slate-900">
                  {statsLoading ? "..." : stats.getMonthlyCustomers}
                </h3>
              </div>
            </div>
          </div>
        </div>

       {/* Add Customer + Stats + Monthly Activity */}
       <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">

            {/* LEFT SIDE - Add Customer Form */}
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow">

  <h2 className="text-2xl font-extrabold text-slate-900">
    Add New Customer
  </h2>

  <form onSubmit={handleCreateCustomer} className="mt-6 space-y-5">

    {/* Full Name */}
    <div>
      <label className="block mb-2 text-sm font-semibold text-slate-700">
        Full Name
      </label>
      <input
        type="text"
        name="name"
        placeholder="Enter full name"
        value={formData.name}
        onChange={handleChange}
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition"
      />
    </div>

    {/* Email */}
    <div>
      <label className="block mb-2 text-sm font-semibold text-slate-700">
        Email Address
      </label>
      <input
        type="email"
        name="email"
        placeholder="Enter email"
        value={formData.email}
        onChange={handleChange}
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition"
      />
    </div>

    {/* Phone */}
    <div>
      <label className="block mb-2 text-sm font-semibold text-slate-700">
        Phone Number
      </label>
      <input
        type="text"
        name="phone"
        placeholder="Enter phone number"
        value={formData.phone}
        onChange={handleChange}
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition"
      />
    </div>

    {/* Button */}
    <button
      type="submit"
      disabled={createLoading}
      className="w-full rounded-2xl bg-gradient-to-r from-slate-900 to-cyan-500 text-white py-3 font-bold transition duration-300 hover:opacity-90 hover:scale-[1.02] cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
    >
      {createLoading ? "Creating..." : "Create Customer"}
    </button>

  </form>
</div>

            {/* RIGHT SIDE */}
            <div className="space-y-6">

              {/* Monthly Activity */}
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow">

                <p className="text-xs font-bold uppercase text-sky-500">
                  Monthly Activity
                </p>

                <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
                  {statsLoading ? "..." : monthlyCount} Customers
                </h2>

                <div className="mt-6">
                  <div className="flex justify-between text-sm">
                    <span>Activity</span>
                    <span>{progressPercentage}%</span>
                  </div>

                  <div className="h-3 bg-slate-100 rounded-full mt-2">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm text-slate-500">Status</p>
                  <h3 className="text-xl font-bold text-slate-900">
                    {activityLabel}
                  </h3>
                </div>

              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">

                <div className="rounded-2xl bg-cyan-50 p-4">
                  <p className="text-sm text-slate-500">Total Customers</p>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {stats.totalCustomers}
                  </h3>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-sm text-slate-500">Added This Month</p>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {stats.getMonthlyCustomers}
                  </h3>
                </div>

                <div className="rounded-2xl bg-violet-50 p-4">
                  <p className="text-sm text-slate-500">Current Role</p>
                  <h3 className="text-lg font-bold capitalize text-slate-900">
                    {currentUserRole || "User"}
                  </h3>
                </div>

                <div className="rounded-2xl bg-slate-100 p-4">
                  <p className="text-sm text-slate-500">Visible Records</p>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {customers.length}
                  </h3>
                </div>

              </div>

            </div>

        </div>
        {/* Customer List */}
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_10px_40px_rgba(15,23,42,0.06)] sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Customer Directory
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Search customers by name, email, phone number, creator, or role.
              </p>
            </div>

            <div className="w-full max-w-xl">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <svg
                  className="h-5 w-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 20l-3-3"
                  />
                </svg>

                <input
                  type="text"
                  placeholder="Search by name, email, phone, creator or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-3">
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              Total Customers: {stats.totalCustomers}
            </span>
            <span className="rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
              Added This Month: {stats.getMonthlyCustomers}
            </span>
            <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              Visible Records: {customers.length}
            </span>
            <span className="rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
              Filtered Results: {filteredCustomers.length}
            </span>
          </div>

          {/* Desktop Table */}
          <div className="hidden overflow-hidden rounded-[24px] border border-slate-200 md:block">
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full">
                <thead className="bg-slate-50">
                  <tr className="text-left text-sm font-bold text-slate-600">
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Phone</th>
                    <th className="px-5 py-4">Created By</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Created On</th>
                    <th className="px-5 py-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {tableLoading ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-5 py-16 text-center text-base font-medium text-slate-500"
                      >
                        Loading customer records...
                      </td>
                    </tr>
                  ) : filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <tr
                        key={customer._id}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 to-cyan-500 text-sm font-bold uppercase text-white">
                              {(customer.name || "C").slice(0, 1)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {customer.name || "-"}
                              </p>
                              <p className="text-xs text-slate-500">
                                ID: {customer._id?.slice(-6) || "-"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {customer.email || "-"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {customer.phone || "-"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {customer.createdByName || "-"}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold capitalize text-sky-700">
                            {customer.createdByRole || "-"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {formatDate(customer.createdAt)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditModal(customer)}
                              className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                            >
                              Edit
                            </button>

                            {currentUserRole === "admin" && (
                              <button
                                onClick={() => openDeleteModal(customer)}
                                className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-5 py-16 text-center text-base text-slate-500"
                      >
                        No customer records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {tableLoading ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-10 text-center text-slate-500">
                Loading customer records...
              </div>
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <div
                  key={customer._id}
                  className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 to-cyan-500 text-base font-bold uppercase text-white">
                      {(customer.name || "C").slice(0, 1)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-bold text-slate-900">
                        {customer.name || "-"}
                      </h3>
                      <p className="mt-1 break-all text-sm text-slate-500">
                        {customer.email || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Phone
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {customer.phone || "-"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Created By
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {customer.createdByName || "-"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Role
                      </p>
                      <p className="mt-1 text-sm font-medium capitalize text-slate-700">
                        {customer.createdByRole || "-"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Created On
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {formatDate(customer.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => openEditModal(customer)}
                      className="w-full rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                    >
                      Edit Customer
                    </button>

                    {currentUserRole === "admin" && (
                      <button
                        onClick={() => openDeleteModal(customer)}
                        className="w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        Delete Customer
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-10 text-center text-slate-500">
                No customer records found.
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold">{filteredCustomers.length}</span> of{" "}
            <span className="font-semibold">{customers.length}</span> customers
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        open={!!editingCustomer}
        onClose={closeEditModal}
        title="Edit Customer"
        subtitle="Update customer details using the form below."
        maxWidth="max-w-2xl"
      >
        <form
          onSubmit={handleUpdateCustomer}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={editFormData.name}
              onChange={handleEditInputChange}
              placeholder="Enter customer name"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={editFormData.email}
              onChange={handleEditInputChange}
              placeholder="Enter customer email"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={editFormData.phone}
              onChange={handleEditInputChange}
              placeholder="Enter phone number"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
            />
          </div>

          <div className="mt-2 flex flex-col gap-3 sm:col-span-2 sm:flex-row">
            <button
              type="submit"
              disabled={editLoading}
              className="w-full rounded-2xl bg-gradient-to-r from-slate-900 to-cyan-500 px-5 py-3.5 text-base font-bold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {editLoading ? "Updating Customer..." : "Update Customer"}
            </button>

            <button
              type="button"
              onClick={closeEditModal}
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={closeDeleteModal}
        title="Delete Customer"
        subtitle="Please confirm before removing this customer record."
        maxWidth="max-w-lg"
      >
        <div>
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
            <p className="text-sm text-slate-600">
              <span className="font-bold text-slate-900">Customer Name:</span>{" "}
              {deleteTarget?.name || "-"}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              <span className="font-bold text-slate-900">Email Address:</span>{" "}
              {deleteTarget?.email || "-"}
            </p>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-500">
            This action will soft delete the customer and remove the record from
            the active customer list.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleDeleteCustomer}
              disabled={deleteLoading}
              className="w-full rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 px-5 py-3.5 text-base font-bold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {deleteLoading ? "Deleting..." : "Yes, Delete Customer"}
            </button>

            <button
              onClick={closeDeleteModal}
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CustomerManagement;
