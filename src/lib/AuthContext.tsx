"use client";

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { authService } from "@/client/auth";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (
    email: string,
    password: string,
    displayName: string,
    additionalData: {
      phone: string;
      memberType: string;
      branch: string;
      year: string;
      ieeeMemberId?: string;
    },
    secretCode?: string
  ) => Promise<User>;
  logout: () => Promise<void>;
  resendVerificationEmail: (email: string, password: string) => Promise<void>;
  updateProfile: (data: { displayName?: string; phone?: string; branch?: string; year?: string; ieeeMemberId?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
const WARNING_TIME = 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const resetInactivityTimer = () => {
    if (!user) return;
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    setShowInactivityWarning(false);
    setRemainingTime(0);

    timeoutRef.current = setTimeout(() => {
      setShowInactivityWarning(true);
      setRemainingTime(WARNING_TIME / 1000);

      warningRef.current = setTimeout(async () => {
        await authService.logout();
        setUser(null);
        setShowInactivityWarning(false);
        window.location.href = '/login';
      }, WARNING_TIME);

      const interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      countdownRef.current = interval;
    }, INACTIVITY_TIMEOUT);
  };

  const handleStayLoggedIn = () => {
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    setShowInactivityWarning(false);
    setRemainingTime(0);
    resetInactivityTimer();
  };

  useEffect(() => {
    if (!user) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      return;
    }

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((event) => window.addEventListener(event, resetInactivityTimer));
    resetInactivityTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetInactivityTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [user]);

  useEffect(() => {
    const storedUser = authService.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const value = {
    user,
    loading,
    login: async (email: string, password: string) => {
      const userData = await authService.login(email, password);
      setUser(userData);
      return userData;
    },
    register: async (
      email: string,
      password: string,
      displayName: string,
      additionalData: {
        phone: string;
        memberType: string;
        branch: string;
        year: string;
        ieeeMemberId?: string;
      },
      secretCode?: string
    ) => {
      const userData = await authService.register(email, password, displayName, additionalData, secretCode);
      setUser(userData);
      return userData;
    },
    logout: async () => {
      await authService.logout();
      setUser(null);
    },
    resendVerificationEmail: async (email: string, password: string) => {
      await authService.resendVerificationEmail(email, password);
    },
    updateProfile: async (data: { displayName?: string; phone?: string; branch?: string; year?: string; ieeeMemberId?: string }) => {
      if (!user) return;
      // Update in Firestore
      await authService.updateUser(user.uid, data);
      // Update local state
      const updatedUser = { ...user, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showInactivityWarning && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={handleStayLoggedIn} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 max-w-md mx-4 w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Session Expiring</h2>
            <p className="text-gray-600 mb-4">
              Your session will expire in <span className="font-semibold text-orange-600">{remainingTime}</span> seconds due to inactivity.
            </p>
            <p className="text-gray-600 mb-6">
              Would you like to stay logged in?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={async () => {
                  await authService.logout();
                  setUser(null);
                  setShowInactivityWarning(false);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Logout Now
              </button>
              <button
                onClick={handleStayLoggedIn}
                className="px-4 py-2 bg-ieee-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Stay Logged In
              </button>
            </div>
          </div>
        </>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
