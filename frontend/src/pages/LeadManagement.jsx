import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { motion as Motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import {
  Plus,
  Search,
  Filter,
  Users,
  Phone,
  Mail,
  Building2,
  Pencil,
  Trash2,
  X,
  BadgeCheck,
  CalendarClock,
  UserCog,
  CheckCircle2,
  BarChart3,
  RefreshCw,
  UserSquare2,
  IdCard,
  ChevronDown,
  Check,
  Sparkles,
  Briefcase,
  CircleDot,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

import {
  getLeadsApi,
  createLeadApi,
  updateLeadApi,
  deleteLeadApi,
  getLeadStatsApi,
  getUsersApi,
  getRestoredLead,
} from "../api/Lead.js";

const initialForm = {
  name: "",
  phone: "",
  email: "",
  company: "",
  source: "Manual",
  status: "New",
  assignedTo: "",
  notes: "",
  nextFollowUp: "",
};

const sourceOptions = [
  "Website",
  "Referral",
  "Facebook",
  "LinkedIn",
  "Instagram",
  "Twitter",
  "Manual",
];

const statusOptions = [
  "New",
  "Contacted",
  "Interested",
  "Not_Interested",
  "Converted",
];

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.05 },
  }),
};

const modalVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: 20, scale: 0.97, transition: { duration: 0.2 } },
};

const getStatusClasses = (status) => {
  switch (status) {
    case "New":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "Contacted":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "Interested":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "Not_Interested":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "Converted":
      return "bg-violet-100 text-violet-700 border-violet-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getSourceClasses = (source) => {
  switch (source) {
    case "Website":
      return "bg-sky-100 text-sky-700";
    case "Referral":
      return "bg-purple-100 text-purple-700";
    case "Facebook":
      return "bg-blue-100 text-blue-700";
    case "LinkedIn":
      return "bg-indigo-100 text-indigo-700";
    case "Instagram":
      return "bg-pink-100 text-pink-700";
    case "Twitter":
      return "bg-cyan-100 text-cyan-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
};

const formatDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (num) => String(num).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const shortId = (id) => {
  if (!id || typeof id !== "string") return "—";
  if (id.length <= 10) return id;
  return `${id.slice(0, 6)}...${id.slice(-4)}`;
};

const normalizeDeletedLeads = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.leads)) return response.leads;
  if (Array.isArray(response?.deletedLeads)) return response.deletedLeads;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.result)) return response.result;
  return [];
};

const getCustomerInfo = (lead) => {
  const customerObj =
    lead?.customer ||
    lead?.customerId ||
    lead?.customerDetails ||
    lead?.convertedCustomer ||
    null;

  const customerName =
    customerObj?.name ||
    customerObj?.fullName ||
    lead?.customerName ||
    lead?.customer?.name ||
    lead?.customer?.fullName ||
    lead?.customerId?.name ||
    lead?.customerId?.fullName ||
    "—";

  const customerId =
    customerObj?._id ||
    (typeof lead?.customerId === "string" ? lead.customerId : "") ||
    lead?.customer?._id ||
    "";

  return { customerName, customerId };
};

const StatCard = ({ title, value, subtitle, icon, colors, index }) => {
  return (
    <Motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={`relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br ${colors} p-5 shadow-sm`}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/30 blur-2xl" />
      <div className="relative flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-900">{value}</h3>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className="rounded-2xl bg-white/90 p-3 shadow-sm">{icon}</div>
      </div>
    </Motion.div>
  );
};

const SearchableUserDropdown = ({
  users = [],
  value,
  onChange,
  placeholder = "Select user",
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);

  const selectedUser = users.find((u) => u._id === value);

  const q = query.toLowerCase().trim();
  const filteredUsers = !q
    ? users
    : users.filter((user) => {
        return (
          user.name?.toLowerCase().includes(q) ||
          user.role?.toLowerCase().includes(q) ||
          user.email?.toLowerCase().includes(q) ||
          user._id?.toLowerCase().includes(q)
        );
      });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-indigo-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
      >
        <div className="min-w-0">
          {selectedUser ? (
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-900">
                {selectedUser.name}
              </p>
              <p className="truncate text-xs text-slate-500">
                {selectedUser.role} • {selectedUser.email} •{" "}
                {shortId(selectedUser._id)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">{placeholder}</p>
          )}
        </div>

        <ChevronDown
          size={18}
          className={`ml-3 shrink-0 text-slate-500 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <Motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="border-b border-slate-100 p-3">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500">
                <Search size={16} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, role, email, id..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto p-2">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isSelected = value === user._id;
                  return (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => {
                        onChange(user._id);
                        setOpen(false);
                        setQuery("");
                        toast.success(`Assigned user selected: ${user.name}`);
                      }}
                      className={`mb-1 flex w-full items-start justify-between gap-3 rounded-2xl px-3 py-3 text-left transition ${
                        isSelected
                          ? "border border-indigo-100 bg-indigo-50"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                          {user.name}
                        </p>
                        <p className="mt-0.5 text-xs text-indigo-600">
                          Role: {user.role}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {user.email}
                        </p>
                        <p className="truncate text-[11px] text-slate-400">
                          ID: {user._id}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="rounded-full bg-indigo-600 p-1 text-white">
                          <Check size={14} />
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-6 text-center text-sm text-slate-500">
                  No user found
                </div>
              )}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LeadCard = ({
  lead,
  currentUserRole,
  openEditModal,
  openDeleteConfirm,
}) => {
  const { customerName, customerId } = getCustomerInfo(lead);

  return (
    <Motion.div
      layout
      className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.08),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(236,72,153,0.08),_transparent_28%)] opacity-0 transition duration-300 group-hover:opacity-100" />

      <div className="relative">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-md">
                {lead.name?.charAt(0)?.toUpperCase() || "L"}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold text-slate-900">
                  {lead.name}
                </h3>
                <p className="truncate text-xs text-slate-500">
                  Created by: {lead.createdByName || "Unknown"} (
                  {lead.createdByRole || "—"})
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                lead.status
              )}`}
            >
              {lead.status}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${getSourceClasses(
                lead.source
              )}`}
            >
              {lead.source}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <div className="mb-2 flex items-center gap-2 text-slate-700">
              <Phone size={16} className="text-indigo-500" />
              <span className="text-sm font-semibold">Phone</span>
            </div>
            <p className="text-sm font-medium text-slate-800">
              {lead.phone || "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <div className="mb-2 flex items-center gap-2 text-slate-700">
              <Mail size={16} className="text-pink-500" />
              <span className="text-sm font-semibold">Email</span>
            </div>
            <p className="break-all text-sm font-medium text-slate-800">
              {lead.email || "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <div className="mb-2 flex items-center gap-2 text-slate-700">
              <Building2 size={16} className="text-sky-500" />
              <span className="text-sm font-semibold">Company</span>
            </div>
            <p className="text-sm font-medium text-slate-800">
              {lead.company || "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <div className="mb-2 flex items-center gap-2 text-slate-700">
              <CalendarClock size={16} className="text-emerald-500" />
              <span className="text-sm font-semibold">Follow Up</span>
            </div>
            <p className="text-sm font-medium text-slate-800">
              {formatDateTime(lead.nextFollowUp)}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-slate-700">
              <UserCog size={16} className="text-violet-500" />
              <span className="text-sm font-semibold">Assigned To</span>
            </div>

            {lead?.assignedTo ? (
              <div className="space-y-1">
                <p className="font-semibold text-slate-900">
                  {lead.assignedTo.name || "—"}
                </p>
                <p className="text-xs text-indigo-600">
                  Role: {lead.assignedTo.role || "—"}
                </p>
                <p className="break-all text-[11px] text-slate-400">
                  ID: {lead.assignedTo._id || "—"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Not assigned</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50 to-pink-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-slate-700">
              <IdCard size={16} className="text-fuchsia-500" />
              <span className="text-sm font-semibold">Lead Details</span>
            </div>

            <div className="space-y-1 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-800">Lead ID:</span>{" "}
                {shortId(lead._id)}
              </p>

              <p>
                <span className="font-medium text-slate-800">Customer Name:</span>{" "}
                {customerName}
              </p>

              <p>
                <span className="font-medium text-slate-800">Customer ID:</span>{" "}
                {customerId ? shortId(customerId) : "—"}
              </p>

              <p>
                <span className="font-medium text-slate-800">Closed At:</span>{" "}
                {formatDateTime(lead.closedAt)}
              </p>
            </div>
          </div>
        </div>

        {lead.notes && (
          <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
            <div className="mb-2 flex items-center gap-2 text-indigo-700">
              <Sparkles size={16} />
              <span className="text-sm font-semibold">Notes</span>
            </div>
            <p className="text-sm leading-6 text-slate-700">{lead.notes}</p>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              <CircleDot size={12} />
              {lead.status}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              <Briefcase size={12} />
              {lead.source}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openEditModal(lead)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Pencil size={15} />
                Edit
              </span>
            </button>

            {currentUserRole === "admin" && (
              <button
                onClick={() => openDeleteConfirm(lead)}
                className="rounded-2xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Trash2 size={15} />
                  Delete
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Motion.div>
  );
};

const DeleteConfirmModal = ({
  open,
  lead,
  deleting,
  onClose,
  onConfirm,
}) => {
  if (!open || !lead) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={deleting ? undefined : onClose}
            className="fixed inset-0 z-[60] bg-slate-900/45 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <Motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-md rounded-[28px] border border-white/70 bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-start gap-4">
                <div className="rounded-2xl bg-rose-100 p-3 text-rose-600">
                  <AlertTriangle size={24} />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Confirm Delete
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Are you sure you want to delete this lead? This action is
                    reversible and the lead can be restored later.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">Lead Name:</span>{" "}
                  {lead.name || "—"}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">Email:</span>{" "}
                  {lead.email || "—"}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">Phone:</span>{" "}
                  {lead.phone || "—"}
                </p>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={deleting}
                  className="rounded-2xl border border-slate-200 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={deleting}
                  className="rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 px-6 py-3 font-semibold text-white shadow-lg shadow-rose-200 transition disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                >
                  {deleting ? "Deleting..." : "Yes, Delete Lead"}
                </button>
              </div>
            </Motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

const RestoreLeadsModal = ({
  open,
  onClose,
  leads,
  loading,
  restoringLeadId,
  search,
  setSearch,
  onRestore,
}) => {
  const filteredLeads = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return leads;

    return leads.filter((lead) =>
      (lead?.name || "").toLowerCase().includes(q)
    );
  }, [leads, search]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={loading ? undefined : onClose}
            className="fixed inset-0 z-[80] bg-slate-900/45 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-[90] flex items-center justify-center p-2 sm:p-4">
            <Motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-2xl"
            >
              <div className="border-b border-slate-100 bg-white/95 px-4 py-4 backdrop-blur-md sm:px-6 sm:py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      <RotateCcw size={14} />
                      Soft Deleted Leads
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
                      Restore Leads
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Yahan saare soft deleted leads dikhenge. Aap name se
                      search karke restore kar sakte ho.
                    </p>
                  </div>

                  <button
                    onClick={onClose}
                    className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mt-4">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500">
                    <Search size={18} className="text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search deleted lead by name..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                {loading ? (
                  <div className="flex min-h-[280px] items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                      <p className="text-sm text-slate-500">
                        Loading deleted leads...
                      </p>
                    </div>
                  </div>
                ) : filteredLeads.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-10 text-center">
                    <h4 className="text-lg font-semibold text-slate-800">
                      No deleted leads found
                    </h4>
                    <p className="mt-2 text-sm text-slate-500">
                      Ya to koi soft deleted lead nahi hai, ya search se result
                      nahi mila.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredLeads.map((lead, index) => {
                      const { customerName } = getCustomerInfo(lead);

                      return (
                        <Motion.div
                          key={lead._id}
                          custom={index}
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md">
                                  {lead?.name?.charAt(0)?.toUpperCase() || "L"}
                                </div>

                                <div className="min-w-0">
                                  <h4 className="truncate text-lg font-bold text-slate-900">
                                    {lead.name || "—"}
                                  </h4>
                                  <p className="truncate text-xs text-slate-500">
                                    Deleted At: {formatDateTime(lead.deletedAt)}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                  <p className="text-xs font-medium text-slate-500">
                                    Email
                                  </p>
                                  <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                                    {lead.email || "—"}
                                  </p>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                  <p className="text-xs font-medium text-slate-500">
                                    Phone
                                  </p>
                                  <p className="mt-1 text-sm font-semibold text-slate-800">
                                    {lead.phone || "—"}
                                  </p>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                  <p className="text-xs font-medium text-slate-500">
                                    Company
                                  </p>
                                  <p className="mt-1 text-sm font-semibold text-slate-800">
                                    {lead.company || "—"}
                                  </p>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                  <p className="text-xs font-medium text-slate-500">
                                    Customer Name
                                  </p>
                                  <p className="mt-1 text-sm font-semibold text-slate-800">
                                    {customerName || "—"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center">
                              <button
                                type="button"
                                disabled={restoringLeadId === lead._id}
                                onClick={() => onRestore(lead)}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-3 font-semibold text-white shadow-lg shadow-emerald-200 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                              >
                                <RotateCcw size={16} />
                                {restoringLeadId === lead._id
                                  ? "Restoring..."
                                  : "Restore"}
                              </button>
                            </div>
                          </div>
                        </Motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 bg-white/95 px-4 py-4 backdrop-blur-md sm:px-6">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-2xl border border-slate-200 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </Motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

const LeadManagement = () => {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    overall: {
      totalLeads: 0,
      closedLeads: 0,
    },
    myStats: {
      myLeads: 0,
      myClosedLeads: 0,
    },
  });

  const [pageLoading, setPageLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editLeadId, setEditLeadId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [deletedLeads, setDeletedLeads] = useState([]);
  const [deletedLeadsLoading, setDeletedLeadsLoading] = useState(false);
  const [deletedLeadSearch, setDeletedLeadSearch] = useState("");
  const [restoringLeadId, setRestoringLeadId] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const currentUserRole = storedUser?.role || "sales";
  const currentUserId = storedUser?._id || "";

  const loadDashboard = async ({ showLoader = true, silent = false } = {}) => {
    try {
      if (showLoader) setPageLoading(true);
      else setTableLoading(true);

      const requests = [getLeadsApi(), getLeadStatsApi()];
      if (currentUserRole === "admin") {
        requests.push(getUsersApi());
      }

      const results = await Promise.all(requests);

      const leadsRes = results[0];
      const statsRes = results[1];
      const usersRes = currentUserRole === "admin" ? results[2] : [];

      setLeads(leadsRes?.leads || []);
      setStats(
        statsRes?.stats || {
          overall: { totalLeads: 0, closedLeads: 0 },
          myStats: { myLeads: 0, myClosedLeads: 0 },
        }
      );
      setUsers(Array.isArray(usersRes) ? usersRes : []);

      if (!silent) toast.success("Lead dashboard updated");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to load lead dashboard"
      );
    } finally {
      setPageLoading(false);
      setTableLoading(false);
    }
  };

  const loadDeletedLeads = async ({ silent = false } = {}) => {
    try {
      setDeletedLeadsLoading(true);
      const response = await getRestoredLead();
      const deletedList = normalizeDeletedLeads(response);
      setDeletedLeads(deletedList);

      if (!silent) toast.success("Deleted leads loaded");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to load deleted leads"
      );
      setDeletedLeads([]);
    } finally {
      setDeletedLeadsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard({ showLoader: true, silent: true });
  }, []);

  const resetForm = () => {
    setFormData(initialForm);
    setEditLeadId(null);
  };

  const openCreateModal = () => {
    resetForm();

    if (currentUserRole === "sales") {
      setFormData((prev) => ({
        ...prev,
        assignedTo: currentUserId,
      }));
    }

    setModalOpen(true);
  };

  const openEditModal = (lead) => {
    setEditLeadId(lead._id);
    setFormData({
      name: lead.name || "",
      phone: lead.phone || "",
      email: lead.email || "",
      company: lead.company || "",
      source: lead.source || "Manual",
      status: lead.status || "New",
      assignedTo: lead?.assignedTo?._id || lead?.assignedTo || "",
      notes: lead.notes || "",
      nextFollowUp: formatDateTimeLocal(lead.nextFollowUp),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => resetForm(), 200);
  };

  const openRestoreModal = async () => {
    setRestoreModalOpen(true);
    setDeletedLeadSearch("");
    await loadDeletedLeads({ silent: true });
  };

  const closeRestoreModal = () => {
    setRestoreModalOpen(false);
    setDeletedLeadSearch("");
    setDeletedLeads([]);
    setRestoringLeadId("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAssignedUserChange = (userId) => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: userId,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const payload = {
        ...formData,
        nextFollowUp: formData.nextFollowUp
          ? new Date(formData.nextFollowUp)
          : null,
      };

      if (!payload.company) delete payload.company;
      if (!payload.notes) delete payload.notes;

      if (currentUserRole !== "admin") {
        delete payload.assignedTo;
      } else if (!payload.assignedTo) {
        delete payload.assignedTo;
      }

      if (editLeadId) {
        await updateLeadApi(editLeadId, payload);
        toast.success("Lead updated successfully");
      } else {
        await createLeadApi(payload);
        toast.success("Lead created successfully");
      }

      closeModal();
      await loadDashboard({ showLoader: false, silent: true });
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Something went wrong while saving lead"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteConfirm = (lead) => {
    setDeleteTarget(lead);
    setDeleteModalOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?._id) return;

    try {
      setDeleting(true);
      await deleteLeadApi(deleteTarget._id);
      toast.success("Lead deleted successfully");
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      await loadDashboard({ showLoader: false, silent: true });
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleRestoreLead = async (lead) => {
    if (!lead?._id) return;

    try {
      setRestoringLeadId(lead._id);

      await updateLeadApi(lead._id, {
        isDeleted: false,
        deletedAt: null,
      });

      toast.success(`${lead.name || "Lead"} restored successfully`);

      await Promise.all([
        loadDeletedLeads({ silent: true }),
        loadDashboard({ showLoader: false, silent: true }),
      ]);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to restore lead");
    } finally {
      setRestoringLeadId("");
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const assignedName = lead?.assignedTo?.name || "";
      const assignedRole = lead?.assignedTo?.role || "";
      const assignedId = lead?.assignedTo?._id || "";

      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        (lead.name || "").toLowerCase().includes(searchValue) ||
        (lead.email || "").toLowerCase().includes(searchValue) ||
        (lead.phone || "").toLowerCase().includes(searchValue) ||
        (lead.company || "").toLowerCase().includes(searchValue) ||
        assignedName.toLowerCase().includes(searchValue) ||
        assignedRole.toLowerCase().includes(searchValue) ||
        assignedId.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" || lead.status === statusFilter;

      const matchesSource =
        sourceFilter === "All" || lead.source === sourceFilter;

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [leads, search, statusFilter, sourceFilter]);

  const localStats = useMemo(() => {
    return {
      total: leads.length,
      interested: leads.filter((item) => item.status === "Interested").length,
      converted: leads.filter((item) => item.status === "Converted").length,
      newLeads: leads.filter((item) => item.status === "New").length,
    };
  }, [leads]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.16),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(236,72,153,0.14),_transparent_25%),linear-gradient(to_bottom_right,_#f8fafc,_#ffffff,_#eef2ff)] px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          style: {
            borderRadius: "16px",
            padding: "12px 14px",
            fontSize: "14px",
            fontWeight: 500,
          },
        }}
      />

      <div className="mx-auto max-w-7xl">
        <Motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6 rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-sm backdrop-blur-xl sm:p-6"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                <BarChart3 size={14} />
                Smart CRM Lead Panel
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                Lead Management Dashboard
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
                Track this month’s overall leads, closed deals, and the
                performance of the currently logged-in user in a modern CRM
                dashboard.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => loadDashboard({ showLoader: false, silent: false })}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer"
              >
                <RefreshCw size={18} />
                Refresh
              </Motion.button>

              {currentUserRole === "admin" && (
                <Motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={openRestoreModal}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 font-medium text-amber-700 shadow-sm transition hover:from-amber-100 hover:to-orange-100 cursor-pointer"
                >
                  <RotateCcw size={18} />
                  Restore Leads
                </Motion.button>
              )}

              <Motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={openCreateModal}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:shadow-xl cursor-pointer"
              >
                <Plus size={18} />
                Add New Lead
              </Motion.button>
            </div>
          </div>
        </Motion.div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            index={0}
            title="Overall Leads This Month"
            value={stats?.overall?.totalLeads || 0}
            subtitle="Total leads created this month"
            icon={<Users className="text-indigo-600" size={22} />}
            colors="from-indigo-100 via-white to-indigo-50"
          />
          <StatCard
            index={1}
            title="Overall Closed This Month"
            value={stats?.overall?.closedLeads || 0}
            subtitle="Converted leads this month"
            icon={<CheckCircle2 className="text-emerald-600" size={22} />}
            colors="from-emerald-100 via-white to-emerald-50"
          />
          <StatCard
            index={2}
            title="My Leads This Month"
            value={stats?.myStats?.myLeads || 0}
            subtitle="Logged-in user total leads"
            icon={<UserSquare2 className="text-sky-600" size={22} />}
            colors="from-sky-100 via-white to-sky-50"
          />
          <StatCard
            index={3}
            title="My Closed This Month"
            value={stats?.myStats?.myClosedLeads || 0}
            subtitle="Logged-in user converted leads"
            icon={<BadgeCheck className="text-violet-600" size={22} />}
            colors="from-violet-100 via-white to-violet-50"
          />
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "All Leads", value: localStats.total, color: "text-slate-900" },
            { label: "New", value: localStats.newLeads, color: "text-blue-600" },
            {
              label: "Interested",
              value: localStats.interested,
              color: "text-emerald-600",
            },
            {
              label: "Converted",
              value: localStats.converted,
              color: "text-violet-600",
            },
          ].map((item, index) => (
            <Motion.div
              key={item.label}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="rounded-3xl border border-slate-200 bg-white/85 p-4 text-center shadow-sm backdrop-blur-lg"
            >
              <p className="text-sm text-slate-500">{item.label}</p>
              <h3 className={`mt-1 text-2xl font-bold ${item.color}`}>
                {item.value}
              </h3>
            </Motion.div>
          ))}
        </div>

        <Motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="mb-6 rounded-[28px] border border-slate-200 bg-white/85 p-4 shadow-sm backdrop-blur-xl sm:p-5"
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500">
                <Search size={18} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by lead, company, assigned name, role, id..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Filter size={18} className="text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                >
                  <option value="All">All Status</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Filter size={18} className="text-slate-400" />
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                >
                  <option value="All">All Sources</option>
                  {sourceOptions.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18 }}
          className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/90 shadow-sm backdrop-blur-xl"
        >
          <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Leads Overview
              </h2>
              <p className="text-sm text-slate-500">
                {filteredLeads.length} lead(s) found
              </p>
            </div>

            <div className="text-xs text-slate-400">
              Searchable assignment + premium lead cards
            </div>
          </div>

          {pageLoading || tableLoading ? (
            <div className="flex min-h-[280px] items-center justify-center p-10">
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                <p className="text-sm text-slate-500">Loading leads...</p>
              </div>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-10 text-center">
              <h3 className="text-lg font-semibold text-slate-800">
                No leads found
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Customize filters or create a new lead to optimize your workflow.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 p-4 sm:p-5 lg:p-6">
              {filteredLeads.map((lead, index) => (
                <Motion.div
                  key={lead._id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <LeadCard
                    lead={lead}
                    currentUserRole={currentUserRole}
                    openEditModal={openEditModal}
                    openDeleteConfirm={openDeleteConfirm}
                  />
                </Motion.div>
              ))}
            </div>
          )}
        </Motion.div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <>
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-sm"
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
              <Motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex max-h-[96vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-2xl"
              >
                <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 px-4 py-4 backdrop-blur-md sm:px-6 sm:py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
                        {editLeadId ? "Edit Lead" : "Create New Lead"}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        A premium, responsive lead form with a searchable assignment dropdown.
                      </p>
                    </div>

                    <button
                      onClick={closeModal}
                      className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <form
                  id="lead-form"
                  onSubmit={handleSubmit}
                  className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Full Name
                      </label>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-indigo-500">
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full rounded-2xl bg-transparent px-4 py-3 outline-none"
                          placeholder="Enter full name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Phone
                      </label>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-indigo-500">
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="w-full rounded-2xl bg-transparent px-4 py-3 outline-none"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Email
                      </label>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-indigo-500">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full rounded-2xl bg-transparent px-4 py-3 outline-none"
                          placeholder="Enter email"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Company
                      </label>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-indigo-500">
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="w-full rounded-2xl bg-transparent px-4 py-3 outline-none"
                          placeholder="Enter company name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Lead Source
                      </label>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-indigo-500">
                        <select
                          name="source"
                          value={formData.source}
                          onChange={handleChange}
                          className="w-full rounded-2xl bg-transparent px-4 py-3 outline-none"
                        >
                          {sourceOptions.map((source) => (
                            <option key={source} value={source}>
                              {source}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Lead Status
                      </label>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-indigo-500">
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full rounded-2xl bg-transparent px-4 py-3 outline-none cursor-pointer"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {currentUserRole === "admin" && (
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Assign To
                        </label>

                        <SearchableUserDropdown
                          users={users}
                          value={formData.assignedTo}
                          onChange={handleAssignedUserChange}
                          placeholder="Search and select user"
                        />

                        <p className="mt-2 text-xs text-slate-500">
                          Search by name, role, email ya id.
                        </p>
                      </div>
                    )}

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Next Follow Up
                      </label>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-indigo-500">
                        <input
                          type="datetime-local"
                          name="nextFollowUp"
                          value={formData.nextFollowUp}
                          onChange={handleChange}
                          className="w-full rounded-2xl bg-transparent px-4 py-3 outline-none cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Notes
                      </label>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-indigo-500">
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          rows={4}
                          className="w-full resize-none rounded-2xl bg-transparent px-4 py-3 outline-none"
                          placeholder="Write lead notes here..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4 rounded-3xl bg-gradient-to-r from-slate-50 to-indigo-50 p-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/80 p-4">
                      <div className="mb-2 flex items-center gap-2 text-slate-700">
                        <UserCog size={16} />
                        <span className="text-sm font-semibold">
                          Assignment Preview
                        </span>
                      </div>
                      {currentUserRole === "admin" ? (
                        <p className="text-sm text-slate-600">
                          Selected User:{" "}
                          <span className="font-medium text-slate-900">
                            {users.find((u) => u._id === formData.assignedTo)?.name ||
                              "No user selected"}
                          </span>
                        </p>
                      ) : (
                        <p className="text-sm text-slate-600">
                          Lead assignment is automatically handled by the backend
                          for users assigned the sales role.
                        </p>
                      )}
                    </div>

                    <div className="rounded-2xl bg-white/80 p-4">
                      <div className="mb-2 flex items-center gap-2 text-slate-700">
                        <IdCard size={16} />
                        <span className="text-sm font-semibold">
                          Conversion Note
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        If the status is <strong>Converted</strong>, the backend
                        will automatically create or link the customer and set the{" "}
                        <strong>closedAt</strong> field.
                      </p>
                    </div>
                  </div>
                </form>

                <div className="sticky bottom-0 z-10 border-t border-slate-100 bg-white/95 px-4 py-4 backdrop-blur-md sm:px-6">
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-2xl border border-slate-200 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>

                    <Motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      form="lead-form"
                      type="submit"
                      disabled={submitting}
                      className="rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-200 transition disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                    >
                      {submitting
                        ? "Processing..."
                        : editLeadId
                        ? "Update Lead"
                        : "Create Lead"}
                    </Motion.button>
                  </div>
                </div>
              </Motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <DeleteConfirmModal
        open={deleteModalOpen}
        lead={deleteTarget}
        deleting={deleting}
        onClose={closeDeleteConfirm}
        onConfirm={handleDeleteConfirm}
      />

      <RestoreLeadsModal
        open={restoreModalOpen}
        onClose={closeRestoreModal}
        leads={deletedLeads}
        loading={deletedLeadsLoading}
        restoringLeadId={restoringLeadId}
        search={deletedLeadSearch}
        setSearch={setDeletedLeadSearch}
        onRestore={handleRestoreLead}
      />
    </div>
  );
};

export default LeadManagement;
