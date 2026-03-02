"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from URL hash (Supabase puts tokens there)
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth error:", error);
          setStatus("error");
          setMessage(error.message);
          return;
        }

        if (data.session) {
          // Email confirmed, session established
          setStatus("success");
          setMessage("Email verified successfully! Redirecting to login...");
          
          // Store user in localStorage
          const user = data.session.user;
          localStorage.setItem('user', JSON.stringify({
            uid: user.id,
            email: user.email,
            displayName: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
            role: user.user_metadata?.role || 'student',
            emailVerified: true,
          }));

          // Redirect to login after a short delay
          setTimeout(() => {
            router.push("/login?verified=true");
          }, 2000);
        } else {
          // No session - check if this is just a confirmation link click
          // Supabase may have already confirmed the email but not created a session
          setStatus("success");
          setMessage("Email verified! You can now login to your account.");
          
          setTimeout(() => {
            router.push("/login?verified=true");
          }, 3000);
        }
      } catch (err) {
        console.error("Callback error:", err);
        setStatus("error");
        setMessage("Something went wrong. Please try again or contact support.");
      }
    };

    handleCallback();
  }, [router]);

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
        {status === "loading" && (
          <>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
            >
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Verifying Email
            </h2>
          </>
        )}

        {status === "success" && (
          <>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Email Verified!
            </h2>
          </>
        )}

        {status === "error" && (
          <>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
            >
              <XCircle className="w-12 h-12 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Verification Failed
            </h2>
          </>
        )}

        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {status !== "loading" && (
          <a 
            href="/login" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-1"
          >
            Go to Login
          </a>
        )}
      </motion.div>
    </div>
  );
}
