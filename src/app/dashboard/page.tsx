"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Calendar, Bell, User, Settings, ChevronRight, Clock, 
  Award, Mail, Phone, BookOpen, Zap, 
  Image, Newspaper, Users, LogOut, Edit3, CreditCard, Star, Shield
} from "lucide-react";
import { eventsService } from "@/client/services";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      if (user) {
        try {
          const events = await eventsService.getAll();
          const upcoming = events.filter(event => {
            const eventDate = new Date(event.date);
            const today = new Date();
            return eventDate >= today;
          }).slice(0, 3);
          setUpcomingEvents(upcoming);
        } catch (error) {
          console.error("Failed to fetch events", error);
        } finally {
          setEventsLoading(false);
        }
      }
    };

    fetchUpcomingEvents();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Header />
      
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 min-h-screen pb-12">
        <div className="container-custom py-4 md:py-8 px-3 md:px-4">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            
            {/* Welcome Header */}
            <motion.div variants={itemVariants} className="relative mb-4 md:mb-8">
              <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl md:rounded-3xl p-4 md:p-8 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-40 md:w-80 h-40 md:h-80 bg-white/5 rounded-full blur-2xl md:blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-30 md:w-60 h-30 md:h-60 bg-indigo-500/20 rounded-full blur-xl md:blur-3xl"></div>
                
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
                  <div className="flex items-center gap-3 md:gap-6">
                    <div className="w-14 md:w-20 h-14 md:h-20 bg-white/15 rounded-xl md:rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg border border-white/20 flex-shrink-0">
                      <User className="w-7 md:w-10 h-7 md:h-10" />
                    </div>
                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-2 px-2 md:px-3 py-1 bg-white/10 rounded-full mb-1 md:mb-2">
                        <Star className="w-3 h-3 text-yellow-300" />
                        <span className="text-xs font-medium">{user.role === 'admin' ? 'Administrator' : 'Student Member'}</span>
                      </div>
                      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold truncate">
                        Welcome, {user.displayName?.split(' ')[0]}!
                      </h1>
                      <p className="text-blue-100 text-xs md:text-sm truncate max-w-xs md:max-w-none">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 md:gap-3">
                    <Link href="/notifications" className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-white/10 hover:bg-white/20 rounded-lg md:rounded-xl backdrop-blur-sm transition-all hover:scale-105 text-sm md:text-base">
                      <Bell className="w-4 md:w-5 h-4 md:h-5" />
                      <span className="font-medium hidden sm:inline">Notifications</span>
                    </Link>
                    <Link href="/settings" className="flex items-center justify-center p-2 md:py-2.5 bg-white/10 hover:bg-white/20 rounded-lg md:rounded-xl backdrop-blur-sm transition-all hover:scale-105">
                      <Settings className="w-4 md:w-5 h-4 md:h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions - Enhanced */}
            <motion.div variants={itemVariants} className="mb-4 md:mb-8">
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h2 className="text-base md:text-lg font-semibold text-slate-800">Quick Actions</h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
                {user.role === "admin" && (
                  <Link href="/userlist" className="group bg-white rounded-xl p-3 md:p-4 shadow-sm border border-slate-100 hover:shadow-xl hover:border-purple-200 hover:-translate-y-1 transition-all">
                    <div className="w-10 md:w-12 h-10 md:h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-2 md:mb-3 group-hover:scale-110 transition-transform">
                      <Shield className="w-5 md:w-6 h-5 md:h-6 text-purple-600" />
                    </div>
                    <p className="text-xs md:text-sm font-medium text-slate-700">User List</p>
                  </Link>
                )}
                
                <Link href="/events" className="group bg-white rounded-xl p-3 md:p-4 shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all">
                  <div className="w-10 md:w-12 h-10 md:h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-2 md:mb-3 group-hover:scale-110 transition-transform">
                    <Calendar className="w-5 md:w-6 h-5 md:h-6 text-blue-600" />
                  </div>
                  <p className="text-xs md:text-sm font-medium text-slate-700">Browse Events</p>
                </Link>
                
                <Link href="/gallery" className="group bg-white rounded-xl p-3 md:p-4 shadow-sm border border-slate-100 hover:shadow-xl hover:border-purple-200 hover:-translate-y-1 transition-all">
                  <div className="w-10 md:w-12 h-10 md:h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-2 md:mb-3 group-hover:scale-110 transition-transform">
                    <Image className="w-5 md:w-6 h-5 md:h-6 text-purple-600" />
                  </div>
                  <p className="text-xs md:text-sm font-medium text-slate-700">Gallery</p>
                </Link>
                
                <Link href="/members" className="group bg-white rounded-xl p-3 md:p-4 shadow-sm border border-slate-100 hover:shadow-xl hover:border-green-200 hover:-translate-y-1 transition-all">
                  <div className="w-10 md:w-12 h-10 md:h-12 bg-green-50 rounded-xl flex items-center justify-center mb-2 md:mb-3 group-hover:scale-110 transition-transform">
                    <Users className="w-5 md:w-6 h-5 md:h-6 text-green-600" />
                  </div>
                  <p className="text-xs md:text-sm font-medium text-slate-700">Members</p>
                </Link>
                
                <Link href="/about" className="group bg-white rounded-xl p-3 md:p-4 shadow-sm border border-slate-100 hover:shadow-xl hover:border-orange-200 hover:-translate-y-1 transition-all">
                  <div className="w-10 md:w-12 h-10 md:h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-2 md:mb-3 group-hover:scale-110 transition-transform">
                    <Award className="w-5 md:w-6 h-5 md:h-6 text-orange-600" />
                  </div>
                  <p className="text-xs md:text-sm font-medium text-slate-700">About Us</p>
                </Link>

                <button onClick={handleLogout} className="group bg-white rounded-xl p-3 md:p-4 shadow-sm border border-slate-100 hover:shadow-xl hover:border-red-200 hover:-translate-y-1 transition-all">
                  <div className="w-10 md:w-12 h-10 md:h-12 bg-red-50 rounded-xl flex items-center justify-center mb-2 md:mb-3 group-hover:scale-110 transition-transform">
                    <LogOut className="w-5 md:w-6 h-5 md:h-6 text-red-600" />
                  </div>
                  <p className="text-xs md:text-sm font-medium text-slate-700">Logout</p>
                </button>
              </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Left Column - Profile Card */}
              <motion.div variants={itemVariants}>
                <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      My Profile
                    </h2>
                    <Link href="/settings" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                      <Edit3 className="w-4 h-4" /> Edit
                    </Link>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-500">Branch</p>
                        <p className="text-sm font-medium text-slate-800 truncate">{user.branch || "Not set"}</p>
                      </div>
                    </div>
                    
                    {user.memberType !== 'Faculty' && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <Award className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-500">Year</p>
                          <p className="text-sm font-medium text-slate-800">{user.year || "Not set"}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="text-sm font-medium text-slate-800 truncate">{user.phone || "Not set"}</p>
                      </div>
                    </div>
                    
                    {user.ieeeMemberId && (
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
                        <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-500">IEEE Member ID</p>
                          <p className="text-sm font-medium text-slate-800 truncate">{user.ieeeMemberId}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Right Column - Upcoming Events */}
              <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-2">
                <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h2 className="text-base md:text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Upcoming Events
                    </h2>
                    <Link href="/events" className="text-blue-600 text-xs md:text-sm font-medium hover:underline flex items-center gap-1">
                      View All <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />
                    </Link>
                  </div>

                  {eventsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-slate-50 rounded-xl animate-pulse">
                          <div className="w-10 md:w-12 h-10 md:h-12 bg-slate-200 rounded-lg md:rounded-xl flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : upcomingEvents.length > 0 ? (
                    <div className="space-y-2 md:space-y-3">
                      {upcomingEvents.map((event) => (
                        <Link
                          key={event.id}
                          href={`/events/${event.id}`}
                          className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-slate-50 hover:bg-blue-50 rounded-xl transition-colors group"
                        >
                          <div className="w-10 md:w-12 h-10 md:h-12 bg-blue-100 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <Calendar className="w-5 md:w-6 h-5 md:h-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-slate-800 truncate group-hover:text-blue-600 transition-colors text-sm md:text-base">
                              {event.title}
                            </h3>
                            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-slate-500">
                              <Clock className="w-3 md:w-4 h-3 md:h-4 flex-shrink-0" />
                              <span className="truncate">{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 md:w-5 h-4 md:h-5 text-slate-300 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 md:py-12 bg-slate-50 rounded-xl">
                      <div className="w-12 md:w-16 h-12 md:h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                        <Calendar className="w-6 md:w-8 h-6 md:h-8 text-blue-600" />
                      </div>
                      <p className="text-slate-500 text-sm md:text-base mb-2 md:mb-3">No upcoming events</p>
                      <Link href="/events" className="inline-flex items-center gap-1 text-blue-600 font-medium text-xs md:text-sm hover:underline">
                        Browse Events <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </>
  );
}
