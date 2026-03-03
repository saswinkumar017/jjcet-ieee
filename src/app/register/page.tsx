"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { authService } from "@/client/auth";
import { Mail, Lock, User, Phone, Eye, EyeOff, GraduationCap, ArrowLeft, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const branches = [
  "Artificial Intelligence & Data Science",
  "Computer Science & Engineering",
  "Computer Science & Engineering (Cyber Security)",
  "Information Technology",
  "Electronics & Communication Engineering",
  "Electrical & Electronics Engineering",
  "Aeronautical Engineering",
  "Civil Engineering",
  "Mechanical Engineering",
  "MBA",
];

const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export default function RegisterPage() {
  const { register } = useAuth();
  const [step, setStep] = useState<"form" | "success">("form");
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    phone: "",
    branch: "",
    year: "",
    ieeeMemberId: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await register(formData.email, formData.password, formData.displayName, {
        phone: formData.phone,
        branch: formData.branch,
        year: formData.year,
        ieeeMemberId: formData.ieeeMemberId || undefined,
      });
      // If we get here, email is already confirmed (rare case)
      setStep("success");
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message === 'CONFIRMATION_REQUIRED') {
          // Email confirmation required - show success message
          setStep("success");
        } else {
          setError(err.message);
        }
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      await authService.resendVerificationEmail(formData.email, formData.password);
      setCountdown(60);
      setError("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to resend email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };


  // Countdown timer
  useState(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  });

  // Success Screen
  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-white">
        <div className="fixed inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-purple-100 to-indigo-100"></div>
          <motion.div 
            animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-300/30 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-300/30 rounded-full blur-[100px]" 
          />
        </div>
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md text-center relative bg-white/20 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Check Your Email!
          </h2>
          <p className="text-gray-600 mb-2">
            We've sent a confirmation link to
          </p>
          <p className="font-semibold text-purple-600 mb-6">{formData.email}</p>
          <p className="text-gray-600 mb-6">
            Click the link in the email to verify your account. After verification, you can login.
          </p>
          
          {/* Important: Check spam folder */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
            <p className="text-sm text-amber-800 font-medium mb-1">📧 Important!</p>
            <p className="text-sm text-amber-700">
              If you don't see the email, check your <span className="font-semibold"> spam folder</span> or <span className="font-semibold">promotions tab</span>. Our emails sometimes land there.
            </p>
          </div>
          
          <div className="space-y-3">
            <Link href="/login" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-1">
              Go to Login
            </Link>
            
            <button
              onClick={handleResendEmail}
              disabled={countdown > 0 || loading}
              className="block w-full text-center text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              {countdown > 0 ? `Resend in ${countdown}s` : "Didn't receive email? Resend"}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Registration Form
  return (
    <div className="min-h-screen py-12 px-4 relative overflow-hidden bg-white">
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-purple-100 to-indigo-100"></div>
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-96 h-96 bg-pink-300/30 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300/30 rounded-full blur-[100px]" 
        />
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all duration-300 hover:gap-3">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center group">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden shadow-2xl bg-white/80 backdrop-blur-sm border border-white/20 group-hover:scale-105 transition-all duration-300">
                <img src="/logo.png" alt="JJCET IEEE" className="w-full h-full object-contain" />
              </div>
            </Link>
            <p className="text-lg font-semibold text-gray-700 mt-4">JJCET IEEE Student Branch</p>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">
              Register as Student Member
            </h1>
            <p className="text-gray-600 mt-2">
              Join JJCET IEEE Student Branch
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/30 shadow-2xl">
            {error && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center z-10">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      className="w-full h-12 px-4 pl-12 rounded-xl border border-gray-200 bg-white/80 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center z-10">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full h-12 px-4 pl-12 rounded-xl border border-gray-200 bg-white/80 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center z-10">
                      <Phone className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full h-12 px-4 pl-12 rounded-xl border border-gray-200 bg-white/80 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Branch *</label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center z-10">
                      <GraduationCap className="w-5 h-5 text-gray-400" />
                    </div>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      className="w-full h-12 px-4 pl-12 rounded-xl border border-gray-200 bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400/50 appearance-none"
                      required
                    >
                      <option value="">Select Branch</option>
                      {branches.map((branch) => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                    required
                  >
                    <option value="">Select Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IEEE Member ID (Optional)</label>
                  <input
                    type="text"
                    name="ieeeMemberId"
                    value={formData.ieeeMemberId}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white/80 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                    placeholder="Enter your IEEE membership ID"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center z-10">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full h-12 px-4 pl-12 pr-12 rounded-xl border border-gray-200 bg-white/80 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                      placeholder="Create password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center z-10">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full h-12 px-4 pl-12 rounded-xl border border-gray-200 bg-white/80 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </motion.button>
            </form>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="inline-flex items-center text-gray-900 font-semibold hover:underline underline-offset-4">
              Login here
            </Link>
          </motion.p>
        </div>
      </div>
    </div>
  );
}
