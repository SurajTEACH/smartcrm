import React, { useState } from "react";
import { motion as Motion } from "framer-motion";
import Navbar from "../components/NavBar";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/Authentication";
import toast from "react-hot-toast"; 

const Login = ({ setIsAuth }) => {   // ✅ prop receive
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const data = await loginUser({ email, password });

      // ✅ Save token
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 🔥 IMPORTANT (missing tha)
      setIsAuth(true);

      toast.success("Login Successful 🎉");

      // ✅ Role based navigation + replace
      if (data.user.role === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else {
        navigate("/sales-dashboard", { replace: true });
      }

    } catch (error) {
      toast.error(error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-20">
        <Motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 md:p-10 shadow-2xl"
        >
          <Motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center text-2xl sm:text-3xl font-bold text-gray-800"
          >
            Login
          </Motion.h2>

          <p className="mt-2 text-center text-sm sm:text-base text-gray-500">
            Welcome back, please enter your details
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email ID
              </label>
              <Motion.input
                whileFocus={{ scale: 1.01 }}
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 shadow-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>
              <Motion.input
                whileFocus={{ scale: 1.01 }}
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 shadow-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <Motion.button
                onClick={() => navigate("/forget-password")}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0px 12px 30px rgba(37, 99, 235, 0.25)",
                }}
                whileTap={{ scale: 0.97 }}
                className="text-sm font-semibold text-blue-600 hover:text-blue-500 cursor-pointer"
              >
                Forget Password
              </Motion.button>
            </div>

            <Motion.button
              whileHover={{
                scale: 1.03,
                boxShadow: "0px 12px 30px rgba(37, 99, 235, 0.25)",
              }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading} // ✅ FIX
              className="cursor-pointer w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm sm:text-base font-semibold text-white shadow-lg transition hover:bg-blue-700"
            >
              {loading ? "Logging in..." : "Login"} {/* ✅ FIX */}
            </Motion.button>
          </form>
        </Motion.div>
      </div>
    </div>
  );
};

export default Login;