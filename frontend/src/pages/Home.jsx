import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion as Motion, useInView } from "framer-motion";
import {
  FaUsers,
  FaUserShield,
  FaChartLine,
  FaTasks,
  FaArrowRight,
  FaCheckCircle,
  FaBullseye,
  FaCodeBranch,
  FaRocket,
  FaStar,
} from "react-icons/fa";
import Navbar from "../components/NavBar";

/* ─────────────────────────────────────────
Reusable animated section wrapper
───────────────────────────────────────── */
const AnimatedSection = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <Motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </Motion.div>
  );
};

/* ─────────────────────────────────────────
Feature Card
───────────────────────────────────────── */
const FeatureCard = ({ item, index }) => {
  const Icon = item.icon;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <Motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, rotateX: 15 }}
      animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{
        y: -10,
        scale: 1.03,
        boxShadow: "0 30px 60px -10px rgba(0,0,0,0.15)",
        transition: { duration: 0.3 },
      }}
      className="relative group bg-white rounded-3xl p-7 border border-gray-100
                shadow-[0_4px_24px_rgba(0,0,0,0.06)] cursor-pointer overflow-hidden"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Gradient glow blob */}
      <div
        className={`absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br
                    ${item.glow} blur-2xl opacity-0 group-hover:opacity-100
                    transition-opacity duration-500 pointer-events-none`}
      />

      {/* Top accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 rounded-t-3xl
                    bg-gradient-to-r ${item.iconBg}`}
      />

      {/* Icon box */}
      <div
        className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl
                    bg-gradient-to-br ${item.iconBg} shadow-lg mb-5`}
      >
        <Icon className="text-white" size={24} />
      </div>

      <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed mb-5">
        {item.description}
      </p>

      <ul className="space-y-2">
        {item.points.map((p) => (
          <li key={p} className="flex items-center gap-2 text-sm text-gray-600">
            <FaCheckCircle className="shrink-0 text-emerald-500" size={13} />
            {p}
          </li>
        ))}
      </ul>

      {/* Arrow on hover */}
      <Motion.div
        initial={{ opacity: 0, x: -8 }}
        whileHover={{ opacity: 1, x: 0 }}
        className="mt-5 flex items-center gap-1 text-sm font-semibold text-indigo-500"
      >
        Learn more <FaArrowRight size={12} />
      </Motion.div>
    </Motion.div>
  );
};

/* ─────────────────────────────────────────
Main Component
───────────────────────────────────────── */
const Home = () => {
  const features = [
    {
      title: "User & Role Management",
      icon: FaUserShield,
      description:
        "Manage team members efficiently with role-based access control for better workflow management.",
      points: ["Admin Access", "Sales Roles", "Permission Control"],
      glow: "from-violet-400/30 to-fuchsia-500/30",
      iconBg: "from-violet-500 to-fuchsia-600",
    },
    {
      title: "Customer Management",
      icon: FaUsers,
      description:
        "Store and manage all customer information in one centralized and organized system.",
      points: ["Add & Update Customers", "Detailed Profiles", "Quick Access"],
      glow: "from-emerald-400/30 to-teal-500/30",
      iconBg: "from-emerald-500 to-teal-600",
    },
    {
      title: "Lead Tracking",
      icon: FaBullseye,
      description:
        "Track and manage leads across different stages to improve conversion rates.",
      points: ["New Leads", "Follow-ups", "Conversion Tracking"],
      glow: "from-orange-400/30 to-amber-500/30",
      iconBg: "from-orange-500 to-amber-600",
    },
    {
      title: "Task Management",
      icon: FaTasks,
      description:
        "Organize tasks, set deadlines, and improve team productivity with efficient task handling.",
      points: ["Task Creation", "Deadlines", "Reminders"],
      glow: "from-pink-400/30 to-rose-500/30",
      iconBg: "from-pink-500 to-rose-600",
    },
    {
      title: "Sales Pipeline",
      icon: FaCodeBranch,
      description:
        "Visualize and manage the entire sales journey from leads to successful deals.",
      points: ["Pipeline Tracking", "Deal Progress", "Better Conversion"],
      glow: "from-sky-400/30 to-indigo-500/30",
      iconBg: "from-sky-500 to-indigo-600",
    },
    {
      title: "Analytics & Insights",
      icon: FaChartLine,
      description:
        "Gain valuable insights with real-time data and performance tracking.",
      points: ["Customer Metrics", "Sales Reports", "Growth Insights"],
      glow: "from-lime-400/30 to-green-500/30",
      iconBg: "from-lime-500 to-green-600",
    },
  ];

  const stats = [
    {
      label: "Customer Records",
      value: "10K+",
      icon: FaUsers,
      color: "from-violet-500 to-purple-600",
    },
    {
      label: "Lead Tracking",
      value: "Real-Time",
      icon: FaBullseye,
      color: "from-cyan-500 to-sky-600",
    },
    {
      label: "Team Productivity",
      value: "24/7",
      icon: FaRocket,
      color: "from-orange-500 to-amber-600",
    },
    {
      label: "Sales Visibility",
      value: "360°",
      icon: FaChartLine,
      color: "from-emerald-500 to-teal-600",
    },
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Sales Manager",
      text: "SmartCRM transformed how our team tracks leads. Conversion rates improved by 40%!",
      avatar: "PS",
      color: "from-violet-500 to-purple-600",
    },
    {
      name: "Rahul Mehta",
      role: "Business Owner",
      text: "The analytics dashboard gives me real-time insights. Absolutely game-changing tool.",
      avatar: "RM",
      color: "from-cyan-500 to-blue-600",
    },
    {
      name: "Anita Verma",
      role: "Marketing Head",
      text: "Task management and customer profiles in one place — saves us hours every week.",
      avatar: "AV",
      color: "from-emerald-500 to-teal-600",
    },
  ];


  
  return (
    /* ✅ overflow-x-hidden wraps everything */
    <div className="min-h-screen bg-gray-50 text-gray-800 overflow-x-hidden">
      {/* ✅ Navbar — fixed at top, content scrolls under it */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* ✅ Spacer = same height as your Navbar (adjust 64px if navbar is taller) */}
      <div className="h-16" />

      {/* ═══════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════ */}
      <section
        className="relative min-h-[calc(100vh-64px)] flex flex-col items-center
                   justify-center px-4 sm:px-6 overflow-hidden"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50" />

          {/* Decorative blobs */}
          <Motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full
                       bg-gradient-to-br from-indigo-200 to-violet-300 blur-3xl opacity-40"
          />
          <Motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full
                       bg-gradient-to-br from-cyan-200 to-sky-300 blur-3xl opacity-30"
          />
          <Motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4,
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                       w-[700px] h-[700px] rounded-full
                       bg-gradient-to-br from-violet-100 to-indigo-200 blur-3xl opacity-20"
          />
        </div>



        {/* Badge */}
        <Motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border
                     border-indigo-200 bg-white/80 backdrop-blur px-4 py-2
                     text-sm font-medium text-indigo-600 shadow-sm"
        >
          <Motion.span
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            🚀
          </Motion.span>
          Modern CRM Platform for Growing Businesses
        </Motion.div>

        {/* 3D Heading */}
        <div className="text-center max-w-4xl px-2">
          <Motion.h1
            initial={{ opacity: 0, y: 40, rotateX: 25 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
            style={{ transformStyle: "preserve-3d", perspective: "800px" }}
            className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight tracking-tight"
          >
            <span
              className="block text-gray-900
                         drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)]"
            >
              Grow Your Business
            </span>
            <span
              className="block mt-1 bg-gradient-to-r from-indigo-600 via-violet-600
                         to-cyan-500 bg-clip-text text-transparent"
              style={{
                filter: "drop-shadow(0 4px 12px rgba(99,102,241,0.3))",
              }}
            >
              with SmartCRM
            </span>
          </Motion.h1>

          <Motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="mt-6 text-base sm:text-lg text-gray-500 max-w-2xl
                       mx-auto leading-relaxed"
          >
            SmartCRM is a modern customer relationship management platform
            designed to help businesses manage customers, track leads, and
            streamline sales processes — all from a single powerful dashboard.
          </Motion.p>

          {/* ✅ CTA Button only — trust badges removed */}
          <Motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-8 flex flex-col sm:flex-row items-center
                       justify-center gap-4"
          >
            <Link to="/login">
              <Motion.button
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center gap-2 rounded-2xl
                           bg-gradient-to-r from-indigo-600 to-violet-600
                           px-7 py-3.5 text-base font-semibold text-white
                           shadow-[0_8px_30px_rgba(99,102,241,0.4)]
                           hover:shadow-[0_12px_40px_rgba(99,102,241,0.55)]
                           transition-shadow duration-300"
              >
                Get Started Free
                <Motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <FaArrowRight size={14} />
                </Motion.span>
              </Motion.button>
            </Link>
          </Motion.div>
          {/* ✅ Trust badges REMOVED */}
        </div>

        {/* Scroll indicator */}
        <Motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col
                     items-center gap-1 text-gray-400"
        >
          <div
            className="w-6 h-10 rounded-full border-2 border-gray-300
                        flex items-start justify-center p-1"
          >
            <Motion.div
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-indigo-500"
            />
          </div>
        </Motion.div>
      </section>

      {/* ═══════════════════════════════════════
          STATS
      ═══════════════════════════════════════ */}
      <section className="px-4 sm:px-6 py-16 bg-white border-y border-gray-100">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((item, i) => {
              const Icon = item.icon;
              return (
                <AnimatedSection key={item.label} delay={i * 0.1}>
                  <Motion.div
                    whileHover={{ y: -5, scale: 1.03 }}
                    className="relative rounded-2xl bg-white border border-gray-100
                               shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-5 text-center
                               overflow-hidden group"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${item.color}
                                  opacity-0 group-hover:opacity-5 transition-opacity duration-400`}
                    />
                    <div
                      className={`mx-auto mb-3 inline-flex w-11 h-11 items-center
                                  justify-center rounded-xl bg-gradient-to-br
                                  ${item.color} shadow-md`}
                    >
                      <Icon className="text-white" size={18} />
                    </div>
                    <h3
                      className={`text-2xl sm:text-3xl font-black bg-gradient-to-r
                                  ${item.color} bg-clip-text text-transparent`}
                    >
                      {item.value}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500 font-medium">
                      {item.label}
                    </p>
                  </Motion.div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════ */}
      <section className="px-4 sm:px-6 py-20 bg-gray-50">
        <div className="mx-auto max-w-6xl">
          <AnimatedSection className="text-center mb-14">
            <span
              className="inline-block rounded-full bg-indigo-50 border
                         border-indigo-100 px-4 py-1.5 text-xs font-semibold
                         text-indigo-600 mb-4 tracking-wide uppercase"
            >
              Features
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900
                         leading-tight"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              Powerful Features for{" "}
              <span
                className="bg-gradient-to-r from-indigo-600 to-cyan-500
                           bg-clip-text text-transparent"
              >
                Business Growth
              </span>
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto text-base">
              Everything you need to manage your sales pipeline, customers, and
              team — in one beautifully designed platform.
            </p>
          </AnimatedSection>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((item, index) => (
              <FeatureCard key={item.title} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════ */}
      <section className="px-4 sm:px-6 py-20 bg-white">
        <div className="mx-auto max-w-5xl">
          <AnimatedSection className="text-center mb-14">
            <span
              className="inline-block rounded-full bg-cyan-50 border
                         border-cyan-100 px-4 py-1.5 text-xs font-semibold
                         text-cyan-600 mb-4 tracking-wide uppercase"
            >
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
              Up &amp; Running in{" "}
              <span
                className="bg-gradient-to-r from-cyan-500 to-indigo-600
                           bg-clip-text text-transparent"
              >
                3 Simple Steps
              </span>
            </h2>
          </AnimatedSection>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Sign up in seconds — no credit card needed. Your workspace is ready instantly.",
                icon: "🎯",
                color: "from-violet-500 to-purple-600",
              },
              {
                step: "02",
                title: "Add Your Team & Data",
                desc: "Import customers, assign roles, and set up your sales pipeline in minutes.",
                icon: "⚡",
                color: "from-cyan-500 to-sky-600",
              },
              {
                step: "03",
                title: "Track & Grow",
                desc: "Monitor leads, tasks, and analytics to make smarter business decisions.",
                icon: "📈",
                color: "from-emerald-500 to-teal-600",
              },
            ].map((s, i) => (
              <AnimatedSection key={s.step} delay={i * 0.15}>
                <Motion.div
                  whileHover={{ y: -6 }}
                  className="relative rounded-2xl bg-gray-50 border border-gray-100
                             p-7 text-center overflow-hidden group"
                >
                  <span
                    className="absolute -top-4 -right-2 text-8xl font-black
                               text-gray-100 select-none pointer-events-none
                               group-hover:text-indigo-50 transition-colors"
                  >
                    {s.step}
                  </span>
                  <div className="text-4xl mb-4">{s.icon}</div>
                  <div
                    className={`inline-block rounded-full bg-gradient-to-r
                                ${s.color} text-white text-xs font-bold px-3 py-1 mb-3`}
                  >
                    Step {s.step}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {s.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {s.desc}
                  </p>
                </Motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════ */}
      <section
        className="px-4 sm:px-6 py-20 bg-gradient-to-br
                   from-indigo-50 via-white to-cyan-50"
      >
        <div className="mx-auto max-w-5xl">
          <AnimatedSection className="text-center mb-14">
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                >
                  <FaStar className="text-amber-400" size={20} />
                </Motion.div>
              ))}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
              Loved by{" "}
              <span
                className="bg-gradient-to-r from-amber-500 to-orange-500
                           bg-clip-text text-transparent"
              >
                Thousands
              </span>{" "}
              of Teams
            </h2>
          </AnimatedSection>

          <div className="grid gap-5 sm:grid-cols-3">
            {testimonials.map((t, i) => (
              <AnimatedSection key={t.name} delay={i * 0.12}>
                <Motion.div
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white rounded-2xl border border-gray-100
                             shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-6"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <FaStar key={j} className="text-amber-400" size={12} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-5 italic">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br
                                  ${t.color} flex items-center justify-center
                                  text-white text-xs font-bold shadow`}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        {t.name}
                      </p>
                      <p className="text-xs text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </Motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════ */}
      <footer className="border-t border-gray-100 bg-white px-4 sm:px-6 py-8">
        <div
          className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center
                      justify-between gap-4 text-sm text-gray-400"
        >
          <div className="flex items-center gap-2">
            <span className="font-black text-base text-indigo-600">
              SmartCRM
            </span>
            <span>— All rights reserved © 2025</span>
          </div>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a
                key={l}
                href="#"
                className="hover:text-indigo-600 transition-colors duration-200"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
