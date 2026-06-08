import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiFlag,
  FiCheckCircle,
  FiClock,
  FiLoader,
  FiX,
  FiFileText,
  FiUser,
  FiBarChart2,
  FiSearch,
  FiChevronDown,
  FiCheckSquare,
  FiAlertCircle,
  FiInfo,
} from "react-icons/fi";

import {
  createTaskApi,
  deleteTaskApi,
  getTaskStatsApi,
  getTasksApi,
  updateTaskApi,
} from "../api/Task";

import { getUsersApi, getLeadsApi } from "../api/Lead";
import { getAllCustomers } from "../api/Customer";

const initialForm = {
  title: "",
  description: "",
  assignedTo: "",
  relatedTo: "",
  relatedType: "",
  status: "Pending",
  priority: "Medium",
  dueDate: "",
  reminder: "",
  notes: "",
};

const badgeStyles = {
  Pending: "bg-amber-50 text-amber-700 border border-amber-200",
  In_Progress: "bg-blue-50 text-blue-700 border border-blue-200",
  Completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Low: "bg-slate-50 text-slate-600 border border-slate-200",
  Medium: "bg-violet-50 text-violet-700 border border-violet-200",
  High: "bg-rose-50 text-rose-700 border border-rose-200",
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getFirstArray = (arrs) => {
  for (const arr of arrs) {
    if (Array.isArray(arr)) return arr;
  }
  return [];
};

const normalizeUsers = (payload) => {
  const raw = getFirstArray([
    payload,
    payload?.users,
    payload?.data,
    payload?.data?.users,
    payload?.data?.data,
    payload?.data?.data?.users,
  ]);
  return raw
    .map((user) => ({
      _id: user?._id || user?.id || "",
      name: user?.name || user?.fullName || user?.email || "Unnamed User",
      role: user?.role || "user",
      email: user?.email || "",
    }))
    .filter((user) => user._id);
};

const normalizeLeads = (payload) => {
  const raw = getFirstArray([
    payload,
    payload?.leads,
    payload?.data,
    payload?.data?.leads,
    payload?.data?.data,
    payload?.data?.data?.leads,
  ]);
  return raw
    .map((lead) => ({
      _id: lead?._id || lead?.id || "",
      name:
        lead?.name ||
        lead?.fullName ||
        lead?.leadName ||
        lead?.company ||
        lead?.companyName ||
        lead?.email ||
        "Unnamed Lead",
    }))
    .filter((lead) => lead._id);
};

const normalizeCustomers = (payload) => {
  const raw = getFirstArray([
    payload,
    payload?.customers,
    payload?.data,
    payload?.data?.customers,
    payload?.data?.data,
    payload?.data?.data?.customers,
  ]);
  return raw
    .map((customer) => ({
      _id: customer?._id || customer?.id || "",
      name:
        customer?.name ||
        customer?.fullName ||
        customer?.customerName ||
        customer?.company ||
        customer?.companyName ||
        customer?.email ||
        "Unnamed Customer",
    }))
    .filter((customer) => customer._id);
};

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [formData, setFormData] = useState(initialForm);
  const [editFormData, setEditFormData] = useState(initialForm);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [dropdownLoading, setDropdownLoading] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);
  const [search, setSearch] = useState("");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const loadDropdownData = async () => {
    try {
      setDropdownLoading(true);
      const [usersRes, leadsRes, customersRes] = await Promise.all([
        getUsersApi(),
        getLeadsApi(),
        getAllCustomers(),
      ]);

      setUsers(normalizeUsers(usersRes));
      setLeads(normalizeLeads(leadsRes));
      setCustomers(normalizeCustomers(customersRes));
    } catch (error) {
      console.error("Dropdown load error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load dropdown options"
      );
    } finally {
      setDropdownLoading(false);
    }
  };

  const fetchAll = async () => {
    try {
      setPageLoading(true);
      const [tasksRes, statsRes] = await Promise.all([
        getTasksApi(),
        getTaskStatsApi(),
      ]);

      setTasks(tasksRes?.tasks || []);
      setStats(statsRes?.stats || {});

      if (user?.role === "admin") {
        await loadDropdownData();
      }
    } catch (error) {
      console.error("Fetch tasks error:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch tasks list");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleChange = (e, setter = setFormData, state = formData) => {
    const { name, value } = e.target;
    setter({
      ...state,
      [name]: value,
      ...(name === "relatedType" ? { relatedTo: "" } : {}),
    });
  };

  const openCreateModal = async () => {
    if (user?.role !== "admin") return;
    if (!users.length || !leads.length || !customers.length) {
      await loadDropdownData();
    }
    setFormData(initialForm);
    setCreateModalOpen(true);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return toast.error("Task title is required");
    }
    if (!formData.assignedTo.trim()) {
      return toast.error("Please select an assigned user");
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        dueDate: formData.dueDate || null,
        reminder: formData.reminder || null,
        relatedTo: formData.relatedTo || null,
        relatedType: formData.relatedType || null,
      };

      const res = await createTaskApi(payload);
      toast.success(res?.message || "Task created successfully!");
      setCreateModalOpen(false);
      fetchAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = async (task) => {
    if (user?.role === "admin" && (!users.length || !leads.length || !customers.length)) {
      await loadDropdownData();
    }

    setSelectedTask(task);
    setEditFormData({
      title: task?.title || "",
      description: task?.description || "",
      assignedTo: task?.assignedTo?._id || task?.assignedTo || "",
      relatedTo: task?.relatedTo?._id || task?.relatedTo || "",
      relatedType: task?.relatedType || "",
      status: task?.status || "Pending",
      priority: task?.priority || "Medium",
      dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : "",
      reminder: task?.reminder ? task.reminder.slice(0, 16) : "",
      notes: task?.notes || "",
    });
    setEditModalOpen(true);
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    if (!selectedTask?._id) return;

    try {
      setLoading(true);
      const payload = {
        ...editFormData,
        dueDate: editFormData.dueDate || null,
        reminder: editFormData.reminder || null,
        relatedTo: editFormData.relatedTo || null,
        relatedType: editFormData.relatedType || null,
      };

      const res = await updateTaskApi(selectedTask._id, payload);
      toast.success(res?.message || "Task updated successfully!");
      setEditModalOpen(false);
      setSelectedTask(null);
      fetchAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (task) => {
    setSelectedTask(task);
    setDeleteModalOpen(true);
  };

  const handleDeleteTask = async () => {
    if (!selectedTask?._id) return;
    try {
      setLoading(true);
      const res = await deleteTaskApi(selectedTask._id);
      toast.success(res?.message || "Task deleted successfully!");
      setDeleteModalOpen(false);
      setSelectedTask(null);
      fetchAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const q = search.toLowerCase();
    return (
      task?.title?.toLowerCase().includes(q) ||
      task?.description?.toLowerCase().includes(q) ||
      task?.status?.toLowerCase().includes(q) ||
      task?.priority?.toLowerCase().includes(q) ||
      task?.assignedTo?.name?.toLowerCase().includes(q)
    );
  });

  const userOptions = useMemo(() => {
    return users.map((u) => ({
      value: u._id,
      label: u.name,
      subLabel: `${u.role.toUpperCase()} • ${u.email}`,
      searchText: `${u.name} ${u._id} ${u.role} ${u.email}`,
    }));
  }, [users]);

  const createRelatedOptions = useMemo(() => {
    if (formData.relatedType === "Lead") {
      return leads.map((lead) => ({
        value: lead._id,
        label: lead.name,
        subLabel: `Lead ID: ${lead._id}`,
        searchText: `${lead.name} ${lead._id}`,
      }));
    }
    if (formData.relatedType === "Customer") {
      return customers.map((customer) => ({
        value: customer._id,
        label: customer.name,
        subLabel: `Customer ID: ${customer._id}`,
        searchText: `${customer.name} ${customer._id}`,
      }));
    }
    return [];
  }, [formData.relatedType, leads, customers]);

  const editRelatedOptions = useMemo(() => {
    if (editFormData.relatedType === "Lead") {
      return leads.map((lead) => ({
        value: lead._id,
        label: lead.name,
        subLabel: `Lead ID: ${lead._id}`,
        searchText: `${lead.name} ${lead._id}`,
      }));
    }
    if (editFormData.relatedType === "Customer") {
      return customers.map((customer) => ({
        value: customer._id,
        label: customer.name,
        subLabel: `Customer ID: ${customer._id}`,
        searchText: `${customer.name} ${customer._id}`,
      }));
    }
    return [];
  }, [editFormData.relatedType, leads, customers]);

  const statsCards = [
    { title: "Created This Month", value: stats?.myCreatedTasksThisMonth ?? 0, color: "from-cyan-500 to-sky-500", icon: <FiCheckSquare size={22} /> },
    { title: "Total CRM Tasks", value: stats?.totalTasks ?? 0, color: "from-violet-500 to-indigo-500", icon: <FiFileText size={22} /> },
    { title: "Total Assigned Tasks", value: stats?.totalAssignedTasks ?? 0, color: "from-fuchsia-500 to-pink-500", icon: <FiUser size={22} /> },
    { title: "Assigned This Month", value: stats?.assignedTasksThisMonth ?? 0, color: "from-emerald-500 to-teal-500", icon: <FiCalendar size={22} /> },
  ];

  return (
    <div className="min-h-full bg-white text-[#182033]">
      <Toaster position="top-right" />

      <div className="mx-auto max-w-[1600px]">
        {/* Header Hero Area */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8 overflow-hidden rounded-[30px] border border-[#dbe8f3] bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 px-6 py-7 shadow-xl text-white"
        >
          <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute right-0 bottom-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
          
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-cyan-300 backdrop-blur">
                <FiCheckSquare size={13} className="animate-pulse" />
                Workforce Tasks & Action Items
              </div>
              <h1 className="text-2xl font-extrabold sm:text-3xl lg:text-4xl">Task Management</h1>
              <p className="mt-2 text-sm text-slate-300">
                Track, assign, and organize user and client activities in real-time.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold capitalize text-slate-200">
                Role: {user?.role || "user"}
              </span>
              {user?.role === "admin" && (
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-500 hover:to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition duration-200"
                >
                  <FiPlus size={16} /> Create Task
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {statsCards.map((card, i) => (
            <motion.div
              key={card.title}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.title}</p>
                  <h3 className="mt-2 text-3xl font-extrabold text-[#162033]">{card.value}</h3>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-md`}>
                  {card.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm mb-6"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Task Log Sheet</h2>
              <p className="text-xs text-slate-500">Search task records, status stages, or priorities.</p>
            </div>

            <div className="relative w-full md:w-80">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks by title, user, priority..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-slate-50 pl-11 pr-5 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white"
              />
            </div>
          </div>

          {/* Task Grid/List */}
          {pageLoading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <FiLoader className="animate-spin text-indigo-500" size={32} />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50/50 text-center py-12 mt-6">
              <FiFileText className="mb-3 text-slate-300" size={42} />
              <h3 className="text-lg font-bold text-slate-700">No matching tasks</h3>
              <p className="text-sm text-slate-400 max-w-sm">
                No tasks match your search or filter values. Try resetting filters or add a new task.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 mt-6">
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group rounded-[22px] border border-slate-200 bg-white p-5 hover:border-indigo-300 hover:shadow-md transition duration-200"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition">
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeStyles[task.status] || ""}`}>
                            {task.status.replace("_", " ")}
                          </span>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeStyles[task.priority] || ""}`}>
                            {task.priority} Priority
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-4xl">
                        {task.description || "No description provided."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 shrink-0 lg:self-start">
                      <button
                        onClick={() => openEditModal(task)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-700 transition"
                      >
                        <FiEdit2 size={13} /> Edit
                      </button>
                      {user?.role === "admin" && (
                        <button
                          onClick={() => openDeleteModal(task)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 hover:bg-red-100 hover:border-red-200 px-3.5 py-2 text-xs font-bold text-red-600 transition"
                        >
                          <FiTrash2 size={13} /> Delete
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Task details footer row */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <FiUser className="text-slate-400" />
                      <span>Assigned to: <strong className="text-slate-700 font-semibold">{task?.assignedTo?.name || "N/A"}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiFlag className="text-slate-400" />
                      <span>Reference: <strong className="text-slate-700 font-semibold">{task?.relatedType ? `${task.relatedType} (${task.relatedTo?.name || "N/A"})` : "Internal CRM"}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiCalendar className="text-slate-400" />
                      <span>Due date: <strong className="text-slate-700 font-semibold">{formatDate(task?.dueDate)}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiClock className="text-slate-400" />
                      <span>Reminder: <strong className="text-slate-700 font-semibold">{task?.reminder ? formatDate(task.reminder) : "None"}</strong></span>
                    </div>
                  </div>

                  {task.notes && (
                    <div className="mt-3 rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-600 flex gap-2">
                      <FiInfo className="text-indigo-500 mt-0.5 shrink-0" />
                      <span><strong>Agent Notes:</strong> {task.notes}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {createModalOpen && (
          <ModalWrapper onClose={() => setCreateModalOpen(false)}>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Create New Task</h2>
                  <p className="text-xs text-slate-500">Assign a new action item or checklist to a sales agent.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 transition"
                >
                  <FiX />
                </button>
              </div>

              {dropdownLoading ? (
                <div className="flex items-center justify-center py-10">
                  <FiLoader className="animate-spin text-indigo-600" size={24} />
                </div>
              ) : (
                <>
                  <Input
                    label="Task Title *"
                    name="title"
                    value={formData.title}
                    onChange={(e) => handleChange(e)}
                    placeholder="e.g. Schedule demo meeting"
                  />

                  <TextArea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={(e) => handleChange(e)}
                    placeholder="Add descriptive details about what needs to be accomplished..."
                  />

                  <SearchableSelect
                    label="Assigned Agent *"
                    name="assignedTo"
                    value={formData.assignedTo}
                    options={userOptions}
                    onChange={(e) => handleChange(e)}
                    placeholder="Choose sales representative"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Related Reference Entity"
                      name="relatedType"
                      value={formData.relatedType}
                      onChange={(e) => handleChange(e)}
                      options={[
                        { label: "None / General CRM Internal", value: "" },
                        { label: "Lead", value: "Lead" },
                        { label: "Customer", value: "Customer" },
                      ]}
                    />

                    <SearchableSelect
                      label="Linked Lead/Customer Entity"
                      name="relatedTo"
                      value={formData.relatedTo}
                      options={createRelatedOptions}
                      onChange={(e) => handleChange(e)}
                      placeholder={formData.relatedType ? `Select associated ${formData.relatedType.toLowerCase()}` : "Select reference type first"}
                      disabled={!formData.relatedType}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Initial Progress Status"
                      name="status"
                      value={formData.status}
                      onChange={(e) => handleChange(e)}
                      options={[
                        { label: "Pending", value: "Pending" },
                        { label: "In Progress", value: "In_Progress" },
                        { label: "Completed", value: "Completed" },
                      ]}
                    />

                    <Select
                      label="Priority Rank"
                      name="priority"
                      value={formData.priority}
                      onChange={(e) => handleChange(e)}
                      options={[
                        { label: "Low Priority", value: "Low" },
                        { label: "Medium Priority", value: "Medium" },
                        { label: "High Priority", value: "High" },
                      ]}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Due Date Target"
                      name="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => handleChange(e)}
                    />

                    <Input
                      label="Reminder Notification Time"
                      name="reminder"
                      type="datetime-local"
                      value={formData.reminder}
                      onChange={(e) => handleChange(e)}
                    />
                  </div>

                  <TextArea
                    label="Private Task Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange(e)}
                    placeholder="Internal reference notes for the assignee..."
                  />

                  <div className="pt-4 border-t border-slate-100 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCreateModalOpen(false)}
                      className="flex-1 rounded-full border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg hover:opacity-90 disabled:opacity-60 transition"
                    >
                      {loading ? <FiLoader className="animate-spin" /> : <FiPlus />}
                      Create Task
                    </button>
                  </div>
                </>
              )}
            </form>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editModalOpen && (
          <ModalWrapper onClose={() => setEditModalOpen(false)}>
            <form onSubmit={handleEditTask} className="space-y-4">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Edit Action Item</h2>
                  <p className="text-xs text-slate-500">Edit target dates, status updates, or assignments.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 transition"
                >
                  <FiX />
                </button>
              </div>

              {user?.role === "admin" ? (
                <>
                  <Input
                    label="Task Title *"
                    name="title"
                    value={editFormData.title}
                    onChange={(e) => handleChange(e, setEditFormData, editFormData)}
                  />

                  <TextArea
                    label="Description"
                    name="description"
                    value={editFormData.description}
                    onChange={(e) => handleChange(e, setEditFormData, editFormData)}
                  />

                  <SearchableSelect
                    label="Assigned Agent *"
                    name="assignedTo"
                    value={editFormData.assignedTo}
                    options={userOptions}
                    onChange={(e) => handleChange(e, setEditFormData, editFormData)}
                    placeholder="Choose sales representative"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Related Reference Entity"
                      name="relatedType"
                      value={editFormData.relatedType}
                      onChange={(e) => handleChange(e, setEditFormData, editFormData)}
                      options={[
                        { label: "None / General CRM Internal", value: "" },
                        { label: "Lead", value: "Lead" },
                        { label: "Customer", value: "Customer" },
                      ]}
                    />

                    <SearchableSelect
                      label="Linked Lead/Customer Entity"
                      name="relatedTo"
                      value={editFormData.relatedTo}
                      options={editRelatedOptions}
                      onChange={(e) => handleChange(e, setEditFormData, editFormData)}
                      placeholder={editFormData.relatedType ? `Select associated ${editFormData.relatedType.toLowerCase()}` : "Select reference type first"}
                      disabled={!editFormData.relatedType}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Progress Status"
                      name="status"
                      value={editFormData.status}
                      onChange={(e) => handleChange(e, setEditFormData, editFormData)}
                      options={[
                        { label: "Pending", value: "Pending" },
                        { label: "In Progress", value: "In_Progress" },
                        { label: "Completed", value: "Completed" },
                      ]}
                    />

                    <Select
                      label="Priority Rank"
                      name="priority"
                      value={editFormData.priority}
                      onChange={(e) => handleChange(e, setEditFormData, editFormData)}
                      options={[
                        { label: "Low Priority", value: "Low" },
                        { label: "Medium Priority", value: "Medium" },
                        { label: "High Priority", value: "High" },
                      ]}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Due Date Target"
                      name="dueDate"
                      type="date"
                      value={editFormData.dueDate}
                      onChange={(e) => handleChange(e, setEditFormData, editFormData)}
                    />

                    <Input
                      label="Reminder Notification Time"
                      name="reminder"
                      type="datetime-local"
                      value={editFormData.reminder}
                      onChange={(e) => handleChange(e, setEditFormData, editFormData)}
                    />
                  </div>
                </>
              ) : (
                /* Non-admin / Sales representative can only change the Status field of tasks assigned to them */
                <Select
                  label="Update Progress Status"
                  name="status"
                  value={editFormData.status}
                  onChange={(e) => handleChange(e, setEditFormData, editFormData)}
                  options={[
                    { label: "Pending", value: "Pending" },
                    { label: "In Progress", value: "In_Progress" },
                    { label: "Completed", value: "Completed" },
                  ]}
                />
              )}

              <TextArea
                label="Private Task Notes"
                name="notes"
                value={editFormData.notes}
                onChange={(e) => handleChange(e, setEditFormData, editFormData)}
              />

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 rounded-full border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-505 via-indigo-500 to-violet-600 py-3 text-sm font-bold text-white shadow-lg hover:opacity-90 disabled:opacity-60 transition"
                >
                  {loading ? <FiLoader className="animate-spin" /> : <FiCheckCircle />}
                  Save Changes
                </button>
              </div>
            </form>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteModalOpen && (
          <ModalWrapper onClose={() => setDeleteModalOpen(false)}>
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <FiTrash2 size={24} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Delete Task?</h2>
              <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
                Are you sure you want to delete the task <strong className="text-slate-800">"{selectedTask?.title}"</strong>? This action cannot be undone.
              </p>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 rounded-full border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  No, Keep Task
                </button>
                <button
                  onClick={handleDeleteTask}
                  disabled={loading}
                  className="flex-1 rounded-full bg-red-600 hover:bg-red-700 py-3 text-sm font-bold text-white shadow-md disabled:opacity-60 transition"
                >
                  {loading ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskManagement;

// ─── Input Components ─────────────────────────────────────────────────────────
const Input = ({ label, ...props }) => (
  <div>
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</label>
    <input
      {...props}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white"
    />
  </div>
);

const TextArea = ({ label, ...props }) => (
  <div>
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</label>
    <textarea
      {...props}
      rows={3}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white"
    />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div>
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</label>
    <select
      {...props}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const SearchableSelect = ({
  label,
  name,
  value,
  options,
  onChange,
  placeholder = "Select option",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((item) => String(item.value) === String(value));

  const filteredOptions = options.filter((item) =>
    (item.searchText || `${item.label} ${item.subLabel || ""}`)
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div className="relative">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-800 outline-none transition ${
          disabled ? "cursor-not-allowed opacity-60" : "focus:border-indigo-400 focus:bg-white"
        }`}
      >
        <span className={`${selected ? "text-slate-800 font-semibold" : "text-slate-400"}`}>
          {selected ? `${selected.label}` : placeholder}
        </span>
        <FiChevronDown className={`transition text-slate-400 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="border-b border-slate-100 p-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <FiSearch className="text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto p-2">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-400">No matching options</div>
            ) : (
              filteredOptions.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    onChange({ target: { name, value: item.value } });
                    setOpen(false);
                    setQuery("");
                  }}
                  className="w-full rounded-xl px-3 py-2.5 text-left hover:bg-slate-50 transition"
                >
                  <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.subLabel}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ModalWrapper = ({ children, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
    onClick={onClose}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 15 }}
      transition={{ duration: 0.2 }}
      className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-150 bg-white p-6 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </motion.div>
  </motion.div>
);
