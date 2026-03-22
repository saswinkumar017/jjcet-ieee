"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";
import { Menu, X, User, LogOut, Settings, Sparkles, ChevronDown, Bell } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import { notificationsService } from "@/client/services";

const navItems = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Events", href: "/events" },
  { name: "Members", href: "/members" },
  { name: "Gallery", href: "/gallery" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setNotificationOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Load notification count
  useEffect(() => {
    const loadNotificationCount = async () => {
      if (user?.uid) {
        try {
          const count = await notificationsService.getUnreadCount(user.uid);
          setNotificationCount(count);
        } catch (err) {
          console.error("Failed to load notification count:", err);
        }
      } else {
        setNotificationCount(0);
      }
    };
    loadNotificationCount();
    // Poll every 30 seconds
    const interval = setInterval(loadNotificationCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <header className="bg-gradient-to-b from-white/80 to-primary-light/30 border-b border-border/50 shadow-sm relative z-40">
      <div className="px-6 md:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 md:h-24">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="h-14 md:h-24 w-auto flex items-center gap-4">
              <img 
                src="/jjcet-new.png" 
                alt="JJCET" 
                className="h-14 md:h-24 w-auto object-contain"
              />
              <img 
                src="/ieee.png" 
                alt="IEEE" 
                className="h-8 md:h-10 w-auto object-contain"
              />
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                prefetch={false}
                className={cn(
                  "px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted hover:text-primary"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {user && (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className={cn(
                    "p-2 rounded-xl transition-all duration-200 hover:bg-gray-100 relative",
                    notificationOpen && "bg-gray-100"
                  )}
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </span>
                  )}
                </button>
                {notificationOpen && <NotificationDropdown onClose={() => setNotificationOpen(false)} onUnreadCountChange={setNotificationCount} />}
              </div>
            )}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-2xl text-sm font-medium transition-all duration-300 ease-out group z-50",
                    userMenuOpen 
                      ? "bg-gradient-to-r from-purple-100 to-pink-100 shadow-lg shadow-purple-200/50" 
                      : "hover:bg-gray-50"
                  )}
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white group-hover:ring-purple-200 transition-all duration-300 group-hover:scale-105">
                    <span className="text-white text-sm font-bold">
                      {user.displayName?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform duration-300", userMenuOpen && "rotate-180")} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in-down origin-top-right z-50">
                    <div className="px-5 py-4 bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-white text-xl font-bold">
                            {user.displayName?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate flex items-center gap-2">
                            {user.displayName}
                            {user.role === "admin" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-[10px] rounded-full font-medium">
                                <Sparkles className="w-2.5 h-2.5" />
                                Admin
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2 px-3">
                      <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 hover:text-violet-600 transition-all duration-200 rounded-xl mb-1">
                        <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-violet-600" />
                        </div>
                        <span className="font-medium">My Dashboard</span>
                      </Link>
                      <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 hover:text-violet-600 transition-all duration-200 rounded-xl mb-1">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Settings className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="font-medium">Settings</span>
                      </Link>
                      <div className="my-2 mx-3 border-t border-gray-100" />
                      <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 rounded-xl w-full">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <LogOut className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="btn-primary text-sm px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5">
                Login
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl hover:bg-primary-light transition-all duration-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-16 md:top-20 bg-white/95 backdrop-blur-sm z-40 overflow-y-auto">
            <nav className="flex flex-col gap-1 px-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200",
                    pathname === item.href
                      ? "text-primary bg-primary-light"
                      : "text-muted hover:bg-primary-light/50"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border mt-2">
                {user ? (
                  <>
                    <div className="px-4 py-2 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {user.displayName?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{user.displayName}</p>
                        <p className="text-xs text-muted">{user.email}</p>
                      </div>
                    </div>
                    <Link href="/dashboard" className="px-4 py-2.5 text-sm font-medium text-foreground bg-primary-light/50 rounded-xl">
                      Dashboard
                    </Link>
                    <Link href="/settings" className="px-4 py-2.5 text-sm font-medium text-foreground bg-primary-light/50 rounded-xl">
                      Settings
                    </Link>
                    <button onClick={handleLogout} className="px-4 py-2.5 text-sm font-medium text-error text-left bg-error/5 rounded-xl">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="px-4 py-2.5 text-sm font-medium text-foreground bg-primary-light/50 rounded-xl text-center">
                    Login
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
