import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { Listbox, Transition } from "@headlessui/react";
import {
  Search,
  Users,
  ShieldCheck,
  Briefcase,
  Pencil,
  Trash2,
  UserPlus,
  Mail,
  Lock,
  UserCog,
  X,
  ChevronDown,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import {
  getAllUsers,
  createUser,
  updateUser as updateUserApi,
  deleteUser as deleteUserApi,
} from "../api/UserApi.js";

// ─── Constants ────────────────────────────────────────────────────────────────
const roleOptions = [
  {
    value: "admin",
    label: "Admin",
    badge:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm",
    softBg: "bg-emerald-100 text-emerald-700",
  },
  {
    value: "sales",
    label: "Sales Executive",
    badge: "bg-sky-50 text-sky-700 border border-sky-200 shadow-sm",
    softBg: "bg-sky-100 text-sky-700",
  },
];

const emptyForm = { name: "", email: "", password: "", role: "sales" };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const clamp = (val, min = 0, max = 100) =>
  Math.min(max, Math.max(min, Math.round(val)));

const isCurrentMonth = (dateString) => {
  if (!dateString) return false;

  const date = new Date(dateString);
  const now = new Date();

  return (
    !Number.isNaN(date.getTime()) &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};

const normalizeRole = (role = "") => {
  const value = String(role).toLowerCase().trim();
  if (value.includes("admin")) return "admin";
  if (value.includes("sale")) return "sales";
  return value || "sales";
};

const normalizeUser = (user, index = 0) => ({
  id: user?._id || user?.id || `user-${index}`,
  name: user?.name || user?.fullName || user?.username || "Unknown User",
  email: user?.email || "",
  role: normalizeRole(user?.role || "sales"),
  createdAt: user?.createdAt || user?.created_at || null,
});

const extractUsersArray = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.users)) return response.users;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.users)) return response.data.users;
  if (Array.isArray(response?.result)) return response.result;
  return [];
};

const formatDate = (dateString) => {
  if (!dateString) return "No date";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function RoleSelect({ value, onChange }) {
  const selectedRole =
    roleOptions.find((item) => item.value === value) || roleOptions[1];

  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${selectedRole.softBg}`}
              >
                <UserCog size={18} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  Role
                </p>
                <p className="font-semibold text-slate-800">
                  {selectedRole.label}
                </p>
              </div>
            </div>
            <ChevronDown size={18} className="text-slate-500" />
          </div>
        </Listbox.Button>

        <Transition
          as={Fragment}
          enter="transition duration-150 ease-out"
          enterFrom="opacity-0 scale-95 -translate-y-1"
          enterTo="opacity-100 scale-100 translate-y-0"
          leave="transition duration-100 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95 -translate-y-1"
        >
          <Listbox.Options className="relative mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.15)] outline-none">
            {roleOptions.map((role) => (
              <Listbox.Option
                key={role.value}
                value={role.value}
                className={({ active }) =>
                  `cursor-pointer rounded-xl px-4 py-3 transition ${
                    active ? "bg-sky-50" : "bg-white"
                  }`
                }
              >
                {({ selected }) => (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${role.softBg}`}
                      >
                        <UserCog size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">
                          {role.label}
                        </p>
                        <p className="text-xs text-slate-500">
                          {role.value === "admin"
                            ? "Full access & control"
                            : "Lead handling & sales workflow"}
                        </p>
                      </div>
                    </div>
                    {selected && <Check size={18} className="text-sky-600" />}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}

function PasswordField({
  name,
  value,
  onChange,
  placeholder,
  show,
  onToggle,
}) {
  return (
    <div className="relative">
      <Lock
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-14 text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, accent, progress }) {
  const safeProgress = clamp(Number.isFinite(progress) ? progress : 0);

  return (
    <Motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-900">{value}</h3>
        </div>
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg ${accent}`}
        >
          {icon}
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
        <span>{subtitle}</span>
        <span>{safeProgress}%</span>
      </div>

      <div className="h-2.5 w-full rounded-full bg-slate-100">
        <Motion.div
          className={`h-2.5 rounded-full ${accent}`}
          initial={{ width: 0 }}
          animate={{ width: `${safeProgress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </Motion.div>
  );
}

function ModalWrapper({ open, onClose, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <Motion.div
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-md"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <Motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="max-h-[92vh] w-full max-w-lg overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.18)]"
            >
              <div className="max-h-[92vh] overflow-y-auto">{children}</div>
            </Motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function MonthlyRoleCircle({ adminCount, staffCount }) {
  const total = adminCount + staffCount;

  const size = 220;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const adminPercent = total > 0 ? adminCount / total : 0;
  const staffPercent = total > 0 ? staffCount / total : 0;

  const adminLength = circumference * adminPercent;
  const staffLength = circumference * staffPercent;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />

          {total > 0 && (
            <>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="#10b981"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${adminLength} ${circumference - adminLength}`}
                strokeDashoffset={0}
              />

              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="#0ea5e9"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${staffLength} ${circumference - staffLength}`}
                strokeDashoffset={-adminLength}
              />
            </>
          )}
        </svg>

        <div className="absolute text-center">
          <p className="text-4xl font-bold text-slate-900">{total}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            This Month
          </p>
        </div>
      </div>

      <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <p className="text-sm font-semibold text-emerald-800">Admins</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{adminCount}</p>
          <p className="text-xs text-slate-500">
            {total > 0 ? clamp((adminCount / total) * 100) : 0}% of monthly added
          </p>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-sky-500" />
            <p className="text-sm font-semibold text-sky-800">Staff</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{staffCount}</p>
          <p className="text-xs text-slate-500">
            {total > 0 ? clamp((staffCount / total) * 100) : 0}% of monthly added
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function UserManagement() {
  const [allUsers, setAllUsers] = useState([]);

  const [formData, setFormData] = useState(emptyForm);
  const [editFormData, setEditFormData] = useState(emptyForm);

  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [selectedDeleteUser, setSelectedDeleteUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const addFormRef = useRef(null);
  const usersRef = useRef(null);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const resetAddForm = () => {
    setFormData(emptyForm);
    setShowAddPassword(false);
  };

  const getRoleLabel = (role) =>
    role === "admin" ? "Admin" : "Sales Executive";

  const getRoleBadge = (role) =>
    role === "admin"
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
      : "bg-sky-50 text-sky-700 border border-sky-200";

  const getInitials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  // ── Load users ─────────────────────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    try {
      setIsLoadingUsers(true);
      const response = await getAllUsers();
      const rawUsers = extractUsersArray(response);
      setAllUsers(rawUsers.map(normalizeUser));
    } catch (error) {
      console.error("Load users error:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to load users. Please try again."
      );
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ── Search filter ──────────────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return allUsers;

    return allUsers.filter((user) => {
      const roleLabel = getRoleLabel(user.role).toLowerCase();

      return (
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term) ||
        roleLabel.includes(term)
      );
    });
  }, [allUsers, searchTerm]);

  // ── Monthly users ──────────────────────────────────────────────────────────
  const monthlyUsers = useMemo(() => {
    return [...allUsers]
      .filter((user) => isCurrentMonth(user.createdAt))
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime() || 0;
        const dateB = new Date(b.createdAt).getTime() || 0;
        return dateB - dateA;
      });
  }, [allUsers]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = allUsers.length;
    const admins = allUsers.filter((u) => u.role === "admin").length;
    const staff = allUsers.filter((u) => u.role !== "admin").length;
    const monthlyAdded = monthlyUsers.length;

    return {
      total,
      admins,
      staff,
      monthlyAdded,
    };
  }, [allUsers, monthlyUsers]);

  const monthlyRoleStats = useMemo(() => {
    const adminCount = monthlyUsers.filter((u) => u.role === "admin").length;
    const staffCount = monthlyUsers.filter((u) => u.role !== "admin").length;

    return {
      adminCount,
      staffCount,
      total: monthlyUsers.length,
    };
  }, [monthlyUsers]);

  // ── Progress calculations ──────────────────────────────────────────────────
  const totalProgress = stats.total > 0 ? 100 : 0;
  const adminProgress =
    stats.total > 0 ? clamp((stats.admins / stats.total) * 100) : 0;
  const staffProgress =
    stats.total > 0 ? clamp((stats.staff / stats.total) * 100) : 0;
  const monthlyProgress =
    stats.total > 0 ? clamp((stats.monthlyAdded / stats.total) * 100) : 0;

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateForm = (data, currentId = null, isEdit = false) => {
    if (!data.name.trim()) {
      toast.error("Please enter user name");
      return false;
    }

    if (!data.email.trim()) {
      toast.error("Please enter email address");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      toast.error("Please enter valid email address");
      return false;
    }

    if (!isEdit && !data.password.trim()) {
      toast.error("Please enter password");
      return false;
    }

    if (data.password?.trim() && data.password.trim().length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    const emailExists = allUsers.find(
      (u) =>
        u.email.toLowerCase() === data.email.toLowerCase() &&
        String(u.id) !== String(currentId)
    );

    if (emailExists) {
      toast.error("This email already exists");
      return false;
    }

    return true;
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!validateForm(formData, null, false)) return;

    try {
      setIsSubmittingAdd(true);

      const response = await createUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        role: formData.role,
      });

      toast.success(response?.message || "User added successfully");
      resetAddForm();
      await loadUsers();
    } catch (error) {
      console.error("Add user error:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to add user. Please try again."
      );
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  const openEditModal = (user) => {
    setEditingId(user.id);
    setEditFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setShowEditPassword(false);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingId(null);
    setEditFormData(emptyForm);
    setShowEditPassword(false);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    if (!validateForm(editFormData, editingId, true)) return;

    try {
      setIsSubmittingEdit(true);

      const payload = {
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        role: editFormData.role,
        ...(editFormData.password.trim() && {
          password: editFormData.password.trim(),
        }),
      };

      const response = await updateUserApi(editingId, payload);

      toast.success(response?.message || "User updated successfully");
      closeEditModal();
      await loadUsers();
    } catch (error) {
      console.error("Update user error:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to update user. Please try again."
      );
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const openDeleteModal = (user) => {
    setSelectedDeleteUser(user);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedDeleteUser(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!selectedDeleteUser) return;

    try {
      setIsDeleting(true);

      const response = await deleteUserApi(selectedDeleteUser.id);

      toast.success(response?.message || "User deleted successfully");
      closeDeleteModal();
      await loadUsers();
    } catch (error) {
      console.error("Delete user error:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to delete user. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const scrollToAddForm = () =>
    addFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const scrollToUsers = () =>
    usersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          style: {
            background: "rgba(255,255,255,0.92)",
            color: "#0f172a",
            border: "1px solid rgba(203,213,225,0.9)",
            borderRadius: "18px",
            boxShadow: "0 18px 50px rgba(15,23,42,0.12)",
            backdropFilter: "blur(12px)",
            padding: "14px 16px",
          },
          success: { iconTheme: { primary: "#06b6d4", secondary: "#ffffff" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#ffffff" } },
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_25%),radial-gradient(circle_at_top_left,rgba(6,182,212,0.10),transparent_20%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.10),transparent_22%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        {/* ── Hero + Monthly circle ───────────────────────────────────────── */}
        <Motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8 grid grid-cols-1 gap-5 xl:grid-cols-12"
        >
          {/* Hero */}
          <div className="xl:col-span-8 rounded-[34px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
            <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-600 shadow-sm sm:text-xs">
              SmartCRM User Management
            </span>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[46px] lg:leading-[1.08]">
              Manage Users, Roles & Team Access
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              Add employees, assign roles, edit access details and manage your
              full team from one clean and powerful user management dashboard.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700">
                Fast employee onboarding
              </span>
              <span className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700">
                Secure role assignment
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                Team access under control
              </span>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={scrollToUsers}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(90deg,#0f172a_0%,#0f3a59_45%,#06b6d4_100%)] px-6 py-3.5 font-semibold text-white shadow-[0_18px_35px_rgba(8,47,73,0.22)] transition hover:scale-[1.02] sm:w-auto"
              >
                View Users <Users size={18} />
              </button>

              <button
                type="button"
                onClick={scrollToAddForm}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 sm:w-auto"
              >
                Add Employee <UserPlus size={18} />
              </button>
            </div>
          </div>

          {/* Monthly circle card */}
          <div className="xl:col-span-4 rounded-[30px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-500">
              This Month
            </p>


            <div className="mt-6">
              <MonthlyRoleCircle
                adminCount={monthlyRoleStats.adminCount}
                staffCount={monthlyRoleStats.staffCount}
              />
            </div>
          </div>
        </Motion.div>

        {/* ── Stat cards ───────────────────────────────────────────────────── */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats.total}
            subtitle="Current team size"
            progress={totalProgress}
            accent="bg-[linear-gradient(135deg,#06b6d4_0%,#0ea5e9_100%)]"
            icon={<Users size={26} />}
          />
          <StatCard
            title="Admins"
            value={stats.admins}
            subtitle="Share of total users"
            progress={adminProgress}
            accent="bg-[linear-gradient(135deg,#8b5cf6_0%,#6366f1_100%)]"
            icon={<ShieldCheck size={26} />}
          />
          <StatCard
            title="Staff Users"
            value={stats.staff}
            subtitle="Share of total users"
            progress={staffProgress}
            accent="bg-[linear-gradient(135deg,#10b981_0%,#22c55e_100%)]"
            icon={<Briefcase size={26} />}
          />
          <StatCard
            title="Added This Month"
            value={stats.monthlyAdded}
            subtitle="Monthly share of total users"
            progress={monthlyProgress}
            accent="bg-[linear-gradient(135deg,#f59e0b_0%,#f97316_100%)]"
            icon={<UserPlus size={26} />}
          />
        </div>

        {/* ── Add form + Users table ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Add New User */}
          <Motion.div
            ref={addFormRef}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="xl:col-span-4"
          >
            <div className="h-full rounded-[30px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6">
              <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Add New User
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Create employee account and assign role
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#06b6d4_0%,#6366f1_100%)] text-white shadow-lg">
                  <UserPlus size={20} />
                </div>
              </div>

              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleAddChange}
                    placeholder="Enter full name"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleAddChange}
                      placeholder="Enter email address"
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <PasswordField
                    name="password"
                    value={formData.password}
                    onChange={handleAddChange}
                    placeholder="Enter password"
                    show={showAddPassword}
                    onToggle={() => setShowAddPassword((prev) => !prev)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Role
                  </label>
                  <RoleSelect
                    value={formData.role}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, role: value }))
                    }
                  />
                </div>

                <Motion.button
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.01 }}
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#0f172a_0%,#0f3a59_38%,#06b6d4_100%)] px-4 py-3.5 font-semibold text-white shadow-[0_18px_35px_rgba(8,47,73,0.20)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmittingAdd ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Adding...
                    </>
                  ) : (
                    "Add User"
                  )}
                </Motion.button>
              </form>
            </div>
          </Motion.div>

          {/* Users Table */}
          <Motion.div
            ref={usersRef}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="xl:col-span-8"
          >
            <div className="rounded-[30px] border border-slate-200/80 bg-white/95 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    All Users
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Search by{" "}
                    <span className="font-medium text-slate-700">name</span>,{" "}
                    <span className="font-medium text-slate-700">email</span> or{" "}
                    <span className="font-medium text-slate-700">role</span>
                  </p>
                </div>

                <div className="relative w-full lg:max-w-md">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search by name, email, role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-10 text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:text-slate-700"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>

              {searchTerm.trim() && (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">
                    Showing results for:
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                    "{searchTerm.trim()}"
                    <button
                      onClick={() => setSearchTerm("")}
                      className="hover:text-sky-900"
                    >
                      <X size={12} />
                    </button>
                  </span>
                  <span className="text-xs text-slate-400">
                    {filteredUsers.length} result
                    {filteredUsers.length !== 1 ? "s" : ""} found
                  </span>
                </div>
              )}

              {isLoadingUsers ? (
                <div className="flex min-h-[260px] items-center justify-center rounded-[24px] border border-slate-200 bg-white">
                  <div className="flex items-center gap-3 text-slate-500">
                    <Loader2 size={20} className="animate-spin" />
                    Loading users...
                  </div>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden overflow-hidden rounded-[24px] border border-slate-200 lg:block">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[840px] table-fixed">
                        <thead className="bg-slate-50">
                          <tr className="text-left">
                            <th className="w-[28%] px-5 py-4 text-sm font-semibold text-slate-600">
                              User
                            </th>
                            <th className="w-[28%] px-5 py-4 text-sm font-semibold text-slate-600">
                              Email
                            </th>
                           
                           
                            <th className="w-[16%] px-5 py-4 text-sm font-semibold text-slate-600">
                              Role
                            </th>
                            <th className="w-[14%] px-5 py-4 text-sm font-semibold text-slate-600">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <AnimatePresence>
                            {filteredUsers.length > 0 ? (
                              filteredUsers.map((user, index) => (
                                <Motion.tr
                                  key={user.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ delay: index * 0.03 }}
                                  className="border-t border-slate-200 bg-white transition hover:bg-slate-50/70"
                                >
                                  <td className="px-5 py-4 align-middle">
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3b82f6_0%,#8b5cf6_100%)] text-sm font-bold text-white shadow-md">
                                        {getInitials(user.name)}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="truncate font-semibold text-slate-900">
                                          {user.name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                          ID: #{user.id}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="truncate px-5 py-4 text-slate-700">
                                    {user.email}
                                  </td>
                                  
                                  
                                  <td className="px-5 py-4">
                                    <span
                                      className={`inline-flex whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold ${getRoleBadge(
                                        user.role
                                      )}`}
                                    >
                                      {getRoleLabel(user.role)}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4">
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => openEditModal(user)}
                                        className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                                      >
                                        <Pencil size={15} /> Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => openDeleteModal(user)}
                                        className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                                      >
                                        <Trash2 size={15} />
                                      </button>
                                    </div>
                                  </td>
                                </Motion.tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan="5"
                                  className="px-5 py-12 text-center text-slate-500"
                                >
                                  {searchTerm
                                    ? `No users match "${searchTerm}"`
                                    : "No users found."}
                                </td>
                              </tr>
                            )}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile Cards */}
                  <div className="grid gap-4 lg:hidden">
                    <AnimatePresence>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user, index) => (
                          <Motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -14 }}
                            transition={{ delay: index * 0.03 }}
                            className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3b82f6_0%,#8b5cf6_100%)] font-bold text-white">
                                  {getInitials(user.name)}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="truncate font-semibold text-slate-900">
                                    {user.name}
                                  </h4>
                                  <p className="truncate text-sm text-slate-500">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`inline-flex shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold ${getRoleBadge(
                                  user.role
                                )}`}
                              >
                                {getRoleLabel(user.role)}
                              </span>
                            </div>

                            <div className="mt-4 space-y-1 text-sm text-slate-600">
                              <p>User ID: #{user.id}</p>
                              <p>Password: ••••••</p>
                              <p>Created: {formatDate(user.createdAt)}</p>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(user)}
                                className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => openDeleteModal(user)}
                                className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                              >
                                Delete
                              </button>
                            </div>
                          </Motion.div>
                        ))
                      ) : (
                        <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-10 text-center text-slate-500">
                          {searchTerm
                            ? `No users match "${searchTerm}"`
                            : "No users found."}
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>
          </Motion.div>
        </div>
      </div>

      {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
      <ModalWrapper open={isEditModalOpen} onClose={closeEditModal}>
        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Edit User</h3>
              <p className="mt-1 text-sm text-slate-500">
                Update employee details and access role
              </p>
            </div>
            <button
              type="button"
              onClick={closeEditModal}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleUpdateUser} className="space-y-4 px-5 py-6 sm:px-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={editFormData.name}
              onChange={handleEditChange}
              placeholder="Enter full name"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="email"
                name="email"
                value={editFormData.email}
                onChange={handleEditChange}
                placeholder="Enter email address"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Password
            </label>
            <PasswordField
              name="password"
              value={editFormData.password}
              onChange={handleEditChange}
              placeholder="Leave blank to keep current password"
              show={showEditPassword}
              onToggle={() => setShowEditPassword((prev) => !prev)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Role
            </label>
            <RoleSelect
              value={editFormData.role}
              onChange={(value) =>
                setEditFormData((prev) => ({ ...prev, role: value }))
              }
            />
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeEditModal}
              className="w-full rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingEdit}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(90deg,#0f172a_0%,#0f3a59_38%,#06b6d4_100%)] px-6 py-3 font-semibold text-white shadow-[0_18px_35px_rgba(8,47,73,0.20)] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {isSubmittingEdit ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Updating...
                </>
              ) : (
                "Update User"
              )}
            </button>
          </div>
        </form>
      </ModalWrapper>

      {/* ── Delete Modal ────────────────────────────────────────────────────── */}
      <ModalWrapper open={isDeleteModalOpen} onClose={closeDeleteModal}>
        <div className="px-5 py-6 sm:px-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <AlertTriangle size={28} />
          </div>

          <div className="mt-5 text-center">
            <h3 className="text-2xl font-bold text-slate-900">Delete User?</h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-900">
                {selectedDeleteUser?.name}
              </span>
              ? This action cannot be undone.
            </p>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={closeDeleteModal}
              className="w-full rounded-full border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(90deg,#ef4444_0%,#f43f5e_100%)] px-6 py-3 font-semibold text-white shadow-[0_18px_35px_rgba(244,63,94,0.18)] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Deleting...
                </>
              ) : (
                "Yes, Delete User"
              )}
            </button>
          </div>
        </div>
      </ModalWrapper>
    </div>
  );
}

export default UserManagement;
