import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { HiOutlineMenuAlt3, HiX } from "react-icons/hi";
import { RiBarChartBoxFill } from "react-icons/ri";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full px-3 pt-4 sm:px-5 lg:px-8">
      <Motion.nav
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        className="relative mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-slate-950/90 px-3 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl sm:px-4"
      >
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

        {/* Left side */}
        <div className="flex min-w-0 items-center gap-3">

          <Link to="/" className="group flex min-w-0 items-center gap-3">
            <Motion.div
              whileHover={{ rotate: -8, scale: 1.06 }}
              transition={{ type: "spring", stiffness: 260 }}
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 text-white shadow-[0_10px_26px_rgba(14,165,233,0.35),inset_0_2px_8px_rgba(255,255,255,0.24),inset_0_-6px_12px_rgba(0,0,0,0.22)]"
            >
              <span className="absolute inset-0 rounded-full bg-white/10 blur-[1px]" />
              <RiBarChartBoxFill className="relative z-10 text-[23px]" />
            </Motion.div>

            <div className="min-w-0">
              <h2 className="truncate bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-lg font-extrabold leading-none text-transparent sm:text-[1.75rem]">
                SmartCRM
              </h2>
              <p className="mt-1 hidden truncate text-xs font-medium text-slate-400 sm:block">
                Smarter customer growth
              </p>
            </div>
          </Link>
        </div>

        {/* Desktop Right side */}
        <div className="hidden items-center gap-3 md:flex">
          <Motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/login"
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-4px_8px_rgba(0,0,0,0.18)] transition-all duration-300 hover:bg-white/10 hover:shadow-[0_14px_28px_rgba(34,211,238,0.14)]"
            >
              Login
            </Link>
          </Motion.div>
        </div>

        {/* Mobile menu button */}
        <Motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 shadow-[0_8px_20px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)] md:hidden"
        >
          {isOpen ? <HiX size={22} /> : <HiOutlineMenuAlt3 size={22} />}
        </Motion.button>
      </Motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <Motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.28 }}
            className="mx-auto mt-3 flex max-w-7xl flex-col gap-3 rounded-3xl border border-white/10 bg-slate-950/90 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl md:hidden"
          >
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.12)]"
            >
              Login
            </Link>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;
