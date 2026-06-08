import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  FiUser, FiLock, FiSave, FiShield, FiClock,
  FiMail, FiPhone, FiBriefcase, FiAlertCircle,
} from "react-icons/fi";
import api from "../api/axios.js";

const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const Settings = () => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [profile, setProfile] = useState({ name: "", phone: "", department: "" });
  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [serverUser, setServerUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Fetch fresh profile from server
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/auth/me");
        const u = res.data.user;
        setServerUser(u);
        setProfile({ name: u.name || "", phone: u.phone || "", department: u.department || "" });
      } catch {
        // fallback to localStorage
        setProfile({ name: storedUser.name || "", phone: storedUser.phone || "", department: storedUser.department || "" });
      } finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) return toast.error("Name is required");
    setSavingProfile(true);
    try {
      const res = await api.put("/api/auth/update-profile", profile);
      const updatedUser = res.data.user;
      setServerUser(updatedUser);
      // Update localStorage
      const current = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...current, name: updatedUser.name, phone: updatedUser.phone, department: updatedUser.department }));
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally { setSavingProfile(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!passwords.oldPassword || !passwords.newPassword || !passwords.confirmPassword)
      return toast.error("All password fields are required");
    if (passwords.newPassword !== passwords.confirmPassword)
      return toast.error("New passwords do not match");
    if (passwords.newPassword.length < 6)
      return toast.error("Password must be at least 6 characters");
    setSavingPassword(true);
    try {
      await api.post("/api/auth/change-password", passwords);
      toast.success("Password changed successfully!");
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    } finally { setSavingPassword(false); }
  };

  const displayUser = serverUser || storedUser;

  return (
    <div className="min-h-full bg-white text-slate-900">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <Motion.div variants={fadeUp} initial="hidden" animate="show"
          className="relative mb-8 overflow-hidden rounded-[28px] bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 px-6 py-7 text-white shadow-xl">
          <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute right-0 bottom-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            {/* Avatar */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-indigo-600 text-3xl font-bold text-white shadow-xl ring-4 ring-white/20 shrink-0">
              {displayUser?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-300">
                <FiShield size={12} /> Account Settings
              </div>
              <h1 className="text-2xl font-extrabold">{displayUser?.name || "User"}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                <span className="flex items-center gap-1"><FiMail size={13} /> {displayUser?.email || "—"}</span>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold capitalize">{displayUser?.role || "user"}</span>
              </div>
              {displayUser?.lastLogin && (
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  <FiClock size={12} /> Last login: {new Date(displayUser.lastLogin).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </Motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Profile Update */}
          <Motion.div variants={fadeUp} initial="hidden" animate="show"
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-50 p-2.5 text-cyan-600"><FiUser size={20} /></div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Edit Profile</h2>
                <p className="text-xs text-slate-500">Update your personal information</p>
              </div>
            </div>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => <div key={i} className="h-14 animate-pulse rounded-2xl bg-slate-100" />)}
              </div>
            ) : (
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Full Name *</label>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-100 transition">
                    <FiUser size={16} className="text-slate-400 shrink-0" />
                    <input type="text" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Your full name" className="w-full bg-transparent text-sm outline-none text-slate-900 placeholder:text-slate-400" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Phone</label>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-100 transition">
                    <FiPhone size={16} className="text-slate-400 shrink-0" />
                    <input type="text" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="Your phone number" className="w-full bg-transparent text-sm outline-none text-slate-900 placeholder:text-slate-400" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Department</label>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-100 transition">
                    <FiBriefcase size={16} className="text-slate-400 shrink-0" />
                    <input type="text" value={profile.department} onChange={(e) => setProfile((p) => ({ ...p, department: e.target.value }))}
                      placeholder="e.g. Sales, Marketing" className="w-full bg-transparent text-sm outline-none text-slate-900 placeholder:text-slate-400" />
                  </div>
                </div>
                {/* Email (read-only) */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Email (Read Only)</label>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-100 px-4 py-3">
                    <FiMail size={16} className="text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-500">{displayUser?.email || "—"}</span>
                  </div>
                </div>
                <button type="submit" disabled={savingProfile}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed">
                  <FiSave size={16} />
                  {savingProfile ? "Saving..." : "Save Profile"}
                </button>
              </form>
            )}
          </Motion.div>

          {/* Password Change */}
          <Motion.div variants={fadeUp} initial="hidden" animate="show"
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-50 p-2.5 text-indigo-600"><FiLock size={20} /></div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Change Password</h2>
                <p className="text-xs text-slate-500">Keep your account secure</p>
              </div>
            </div>
            <form onSubmit={handlePasswordSave} className="space-y-4">
              {[
                { key: "oldPassword", label: "Current Password", placeholder: "Enter current password" },
                { key: "newPassword", label: "New Password", placeholder: "At least 6 characters" },
                { key: "confirmPassword", label: "Confirm New Password", placeholder: "Repeat new password" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">{field.label}</label>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition">
                    <FiLock size={16} className="text-slate-400 shrink-0" />
                    <input type="password" value={passwords[field.key]} onChange={(e) => setPasswords((p) => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={field.placeholder} className="w-full bg-transparent text-sm outline-none text-slate-900 placeholder:text-slate-400" />
                  </div>
                </div>
              ))}
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3 flex gap-2 text-amber-700 text-xs">
                <FiAlertCircle size={16} className="shrink-0 mt-0.5" />
                Password must be at least 6 characters and different from your current password.
              </div>
              <button type="submit" disabled={savingPassword}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed">
                <FiShield size={16} />
                {savingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>

            {/* Account Info Card */}
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Account Info</p>
              {[
                { label: "Role", value: displayUser?.role || "—" },
                { label: "Member Since", value: displayUser?.createdAt ? new Date(displayUser.createdAt).toLocaleDateString() : "—" },
                { label: "Last Login", value: displayUser?.lastLogin ? new Date(displayUser.lastLogin).toLocaleString() : "Never" },
                { label: "Status", value: displayUser?.isActive !== false ? "✅ Active" : "❌ Inactive" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{item.label}</span>
                  <span className="text-xs font-semibold text-slate-800 capitalize">{item.value}</span>
                </div>
              ))}
            </div>
          </Motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
