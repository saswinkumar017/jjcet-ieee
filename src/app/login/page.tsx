"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { getAuthErrorMessage } from "@/client/auth";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, RefreshCw, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");
  const { login, resendVerificationEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerifiedMessage, setShowVerifiedMessage] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (verified === "true") {
      setShowVerifiedMessage(true);
      router.replace("/login", { scroll: false });
    }
  }, [verified, router]);

  // Cooldown countdown
  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsUnverified(false);
    setResendSuccess(false);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      // Use friendly error message
      const msg = getAuthErrorMessage(err);
      // Detect the unverified error from auth.ts
      if (msg.includes('verify your email') || msg.includes('not verified')) {
        setIsUnverified(true);
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setResendSuccess(false);
    setError("");
    try {
      await resendVerificationEmail(email, password);
      setResendSuccess(true);
      setResendCooldown(60);
    } catch (err: unknown) {
      const msg = getAuthErrorMessage(err);
      setError(msg);
    } finally {
      setResendLoading(false);
    }
  };

  // Show verified success message
  if (showVerifiedMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-white">
        <div className="fixed inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-purple-100 to-indigo-100"></div>
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
            className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Email Verified Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Your account has been verified. You can now login with your credentials.
          </p>
          <a 
            href="/login" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-1"
          >
            Go to Login
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-white">
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-purple-100 to-indigo-100"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-pink-100 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-cyan-100 via-transparent to-transparent"></div>
        
        <motion.div 
          animate={{ 
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-300/30 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-300/30 rounded-full blur-[100px]" 
        />
        
        <div className="absolute inset-0 opacity-30" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} 
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all duration-300 hover:gap-3">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center justify-center group">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden shadow-2xl bg-white/80 backdrop-blur-sm border border-white/20 group-hover:scale-105 transition-all duration-300">
              <img src="/logo.png" alt="JJCET IEEE" className="w-full h-full object-contain" />
            </div>
          </Link>
          <p className="text-lg font-semibold text-gray-700 mt-4">JJCET IEEE Student Branch</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Login to your account</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-xl"
              >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
              </motion.div>
            )}

            {/* Unverified email — resend panel */}
            {isUnverified && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3"
              >
                <p className="text-sm font-medium text-amber-800">
                  Your email address is not verified yet. Check your inbox for the confirmation link.
                </p>
                {resendSuccess && (
                  <p className="text-sm text-green-700 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    Verification email sent! Check your inbox.
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || resendLoading}
                  className="flex items-center gap-2 text-sm font-semibold text-amber-700 hover:text-amber-900 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${resendLoading ? 'animate-spin' : ''}`} />
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : resendLoading
                    ? 'Sending...'
                    : 'Resend verification email'}
                </button>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center z-10">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-4 pl-12 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center z-10">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 pl-12 pr-12 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all duration-300 z-20"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
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
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </motion.button>
            
            <div className="text-center mt-3">
              <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
                Forgot your password?
              </Link>
            </div>
          </form>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6 text-gray-600"
        >
          Don't have an account?{" "}
          <Link href="/register" className="inline-flex items-center text-gray-900 font-semibold hover:underline underline-offset-4 transition-all duration-300">
            Register here
          </Link>
        </motion.p>
      </div>
    </div>
  );
}

function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
