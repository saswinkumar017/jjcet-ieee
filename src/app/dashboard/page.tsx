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
  Award, Mail, Phone, BookOpen, TrendingUp, Zap, 
  Image, Newspaper, Users, Activity, Target, Star,
  FileText, MessageSquare, Clock3, CheckCircle2
} from "lucide-react";
import { eventsService, newsService, galleryService, announcementsService } from "@/client/services";
import { Event, Announcement } from "@/types";

interface DashboardStats {
  totalEvents: number;
  totalNews: number;
  totalGallery: number;
  totalAnnouncements: number;
}

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

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{count}{suffix}</span>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalNews: 0,
    totalGallery: 0,
    totalAnnouncements: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      if (user) {
        try {
          const events = await eventsService.getAll();
          const registered = events.filter((event) => 
            event.registeredUsers?.includes(user.uid)
          );
          setRegisteredEvents(registered);
        } catch (error) {
          console.error("Failed to fetch events", error);
        } finally {
          setEventsLoading(false);
        }
      }
    };

    fetchRegisteredEvents();
  }, [user]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await announcementsService.getAll();
        setAnnouncements(data.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch announcements", error);
      } finally {
        setAnnouncementsLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (user?.role === "admin") {
        try {
          const [events, news, gallery, announcementsData] = await Promise.all([
            eventsService.getAll(),
            newsService.getAll(),
            galleryService.getAll(),
            announcementsService.getAll(),
          ]);
          setStats({
            totalEvents: events.length,
            totalNews: news.length,
            totalGallery: gallery.length,
            totalAnnouncements: announcementsData.length,
          });
        } catch (error) {
          console.error("Failed to fetch stats", error);
        } finally {
          setStatsLoading(false);
        }
      } else {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading || !user) {
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

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-8">
              <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <div className="w-10 md:w-12 h-10 md:h-12 bg-blue-100 rounded-lg md:rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 md:w-6 h-5 md:h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-slate-800"><AnimatedCounter value={registeredEvents.length} /></p>
                <p className="text-xs md:text-sm text-slate-500">Registered Events</p>
              </div>

              <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <div className="w-10 md:w-12 h-10 md:h-12 bg-purple-100 rounded-lg md:rounded-xl flex items-center justify-center">
                    <Award className="w-5 md:w-6 h-5 md:h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-slate-800">{user.year || "N/A"}</p>
                <p className="text-xs md:text-sm text-slate-500">Current Year</p>
              </div>

              <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <div className="w-10 md:w-12 h-10 md:h-12 bg-green-100 rounded-lg md:rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-5 md:w-6 h-5 md:h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-green-600">Active</p>
                <p className="text-xs md:text-sm text-slate-500">Membership Status</p>
              </div>

              <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <div className="w-10 md:w-12 h-10 md:h-12 bg-orange-100 rounded-lg md:rounded-xl flex items-center justify-center">
                    <Target className="w-5 md:w-6 h-5 md:h-6 text-orange-600" />
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-slate-800">{user.branch || "N/A"}</p>
                <p className="text-xs md:text-sm text-slate-500">Branch</p>
              </div>
            </motion.div>

            {/* Admin Stats - Only for admins */}
            {user?.role === "admin" && (
              <motion.div variants={itemVariants} className="mb-4 md:mb-8">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base md:text-lg font-semibold text-slate-800">Website Overview</h2>
                </div>
                
                {statsLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 animate-pulse">
                        <div className="w-10 md:w-12 h-10 md:h-12 bg-slate-200 rounded-lg md:rounded-xl mx-auto mb-2 md:mb-3"></div>
                        <div className="h-6 md:h-8 bg-slate-200 rounded mx-auto mb-2 w-12 md:w-16"></div>
                        <div className="h-3 md:h-4 bg-slate-200 rounded mx-auto w-16 md:w-20"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                    <Link href="/admin/events" className="group bg-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-500/15 transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-2 md:mb-3">
                        <div className="w-10 md:w-12 h-10 md:h-12 bg-blue-50 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Calendar className="w-5 md:w-6 h-5 md:h-6 text-blue-600" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <p className="text-2xl md:text-3xl font-bold text-slate-800"><AnimatedCounter value={stats.totalEvents} /></p>
                      <p className="text-xs md:text-sm text-slate-500">Total Events</p>
                    </Link>
                    
                    <Link href="/admin/news" className="group bg-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-purple-500/15 transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-2 md:mb-3">
                        <div className="w-10 md:w-12 h-10 md:h-12 bg-purple-50 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Newspaper className="w-5 md:w-6 h-5 md:h-6 text-purple-600" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <p className="text-2xl md:text-3xl font-bold text-slate-800"><AnimatedCounter value={stats.totalNews} /></p>
                      <p className="text-xs md:text-sm text-slate-500">News</p>
                    </Link>
                    
                    <Link href="/admin/gallery" className="group bg-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-green-500/15 transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-2 md:mb-3">
                        <div className="w-10 md:w-12 h-10 md:h-12 bg-green-50 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Image className="w-5 md:w-6 h-5 md:h-6 text-green-600" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <p className="text-2xl md:text-3xl font-bold text-slate-800"><AnimatedCounter value={stats.totalGallery} /></p>
                      <p className="text-xs md:text-sm text-slate-500">Gallery</p>
                    </Link>
                    
                    <Link href="/admin/announcements" className="group bg-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-red-500/15 transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-2 md:mb-3">
                        <div className="w-10 md:w-12 h-10 md:h-12 bg-red-50 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Bell className="w-5 md:w-6 h-5 md:h-6 text-red-600" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <p className="text-2xl md:text-3xl font-bold text-slate-800"><AnimatedCounter value={stats.totalAnnouncements} /></p>
                      <p className="text-xs md:text-sm text-slate-500">Announcements</p>
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Left Column - Quick Actions & Profile */}
              <div className="md:col-span-1 lg:col-span-1 space-y-4 md:space-y-6">
                {/* Quick Actions */}
                <motion.div variants={itemVariants} className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100">
                  <h2 className="font-semibold text-slate-800 mb-3 md:mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <Link href="/events" className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-lg md:rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group">
                      <Calendar className="w-5 md:w-6 h-5 md:h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                      <span className="text-xs md:text-sm font-medium text-slate-700">Browse Events</span>
                    </Link>
                    <Link href="/news" className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-lg md:rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors group">
                      <Newspaper className="w-5 md:w-6 h-5 md:h-6 text-purple-600 group-hover:scale-110 transition-transform" />
                      <span className="text-xs md:text-sm font-medium text-slate-700">News</span>
                    </Link>
                    <Link href="/gallery" className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-lg md:rounded-xl bg-green-50 hover:bg-green-100 transition-colors group">
                      <Image className="w-5 md:w-6 h-5 md:h-6 text-green-600 group-hover:scale-110 transition-transform" />
                      <span className="text-xs md:text-sm font-medium text-slate-700">Gallery</span>
                    </Link>
                    <Link href="/members" className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-lg md:rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors group">
                      <Users className="w-5 md:w-6 h-5 md:h-6 text-orange-600 group-hover:scale-110 transition-transform" />
                      <span className="text-xs md:text-sm font-medium text-slate-700">Members</span>
                    </Link>
                  </div>
                </motion.div>

                {/* Profile Card */}
                <motion.div variants={itemVariants} className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100">
                  <h2 className="font-semibold text-slate-800 mb-3 md:mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Profile Info
                  </h2>
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center gap-3 p-2 md:p-3 bg-slate-50 rounded-lg md:rounded-xl">
                      <div className="w-8 md:w-10 h-8 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 md:w-5 h-4 md:h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">Branch</p>
                        <p className="text-sm font-medium text-slate-800 truncate">{user.branch || "Not set"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 md:p-3 bg-slate-50 rounded-lg md:rounded-xl">
                      <div className="w-8 md:w-10 h-8 md:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="w-4 md:w-5 h-4 md:h-5 text-purple-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">Year</p>
                        <p className="text-sm font-medium text-slate-800">{user.year || "Not set"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 md:p-3 bg-slate-50 rounded-lg md:rounded-xl">
                      <div className="w-8 md:w-10 h-8 md:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-4 md:w-5 h-4 md:h-5 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="text-sm font-medium text-slate-800 truncate">{user.phone || "Not set"}</p>
                      </div>
                    </div>
                    {user.ieeeMemberId && (
                      <div className="flex items-center gap-3 p-2 md:p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg md:rounded-xl border border-yellow-100">
                        <div className="w-8 md:w-10 h-8 md:h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Star className="w-4 md:w-5 h-4 md:h-5 text-yellow-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500">IEEE ID</p>
                          <p className="text-sm font-medium text-slate-800 truncate">{user.ieeeMemberId}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Right Column - Events & Announcements */}
              <div className="md:col-span-2 lg:col-span-2 space-y-4 md:space-y-6">
                {/* Registered Events */}
                <motion.div variants={itemVariants} className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h2 className="text-base md:text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="hidden sm:inline">My Registered</span> Events
                    </h2>
                    <Link href="/events" className="text-blue-600 text-xs md:text-sm font-medium hover:underline flex items-center gap-1">
                      View All <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />
                    </Link>
                  </div>

                  {eventsLoading ? (
                    <div className="space-y-2 md:space-y-3">
                      {[1, 2].map((i) => (
                        <div key={i} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-slate-50 rounded-lg md:rounded-xl animate-pulse">
                          <div className="w-10 md:w-12 h-10 md:h-12 bg-slate-200 rounded-lg md:rounded-xl flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : registeredEvents.length > 0 ? (
                    <div className="space-y-2 md:space-y-3">
                      {registeredEvents.slice(0, 4).map((event) => (
                        <Link
                          key={event.id}
                          href={`/events/${event.id}`}
                          className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-slate-50 hover:bg-blue-50 rounded-lg md:rounded-xl transition-colors group"
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
                    <div className="text-center py-6 md:py-10 bg-slate-50 rounded-lg md:rounded-xl">
                      <div className="w-12 md:w-16 h-12 md:h-16 bg-blue-100 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                        <Calendar className="w-6 md:w-8 h-6 md:h-8 text-blue-600" />
                      </div>
                      <p className="text-slate-500 text-sm md:text-base mb-2 md:mb-3">No registered events yet</p>
                      <Link href="/events" className="inline-flex items-center gap-1 text-blue-600 font-medium text-xs md:text-sm hover:underline">
                        Browse Events <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />
                      </Link>
                    </div>
                  )}
                </motion.div>

                {/* Latest Announcements */}
                <motion.div variants={itemVariants} className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h2 className="text-base md:text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-red-500" />
                      Latest Announcements
                    </h2>
                    <Link href="/announcements" className="text-blue-600 text-xs md:text-sm font-medium hover:underline flex items-center gap-1">
                      View All <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />
                    </Link>
                  </div>

                  {announcementsLoading ? (
                    <div className="space-y-2 md:space-y-3">
                      {[1, 2].map((i) => (
                        <div key={i} className="p-3 md:p-4 bg-slate-50 rounded-lg md:rounded-xl animate-pulse">
                          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : announcements.length > 0 ? (
                    <div className="space-y-2 md:space-y-3">
                      {announcements.map((announcement, index) => (
                        <Link
                          key={announcement.id}
                          href="/announcements"
                          className="block p-3 md:p-4 bg-slate-50 hover:bg-red-50 rounded-lg md:rounded-xl transition-colors group"
                        >
                          <div className="flex items-start gap-2 md:gap-3">
                            <div className={`w-2 h-2 rounded-full mt-1.5 md:mt-2 flex-shrink-0 ${index === 0 ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-slate-800 group-hover:text-red-600 transition-colors line-clamp-1 text-sm md:text-base">
                                {announcement.title}
                              </h3>
                              <p className="text-xs md:text-sm text-slate-500 line-clamp-2 mt-1">
                                {announcement.content}
                              </p>
                              <div className="flex items-center gap-1 md:gap-2 text-xs text-slate-400 mt-1 md:mt-2">
                                <Clock3 className="w-3 h-3 flex-shrink-0" />
                                {new Date(announcement.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 md:py-10 bg-slate-50 rounded-lg md:rounded-xl">
                      <div className="w-12 md:w-16 h-12 md:h-16 bg-red-100 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                        <Bell className="w-6 md:w-8 h-6 md:h-8 text-red-600" />
                      </div>
                      <p className="text-slate-500 text-sm md:text-base">No announcements</p>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </>
  );
}
