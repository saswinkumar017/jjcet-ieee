"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { User as UserIcon, Shield, UserCheck, Mail, Phone, BookOpen, Calendar, BadgeCheck, ChevronRight, Search, Filter, ArrowUpCircle, ArrowDownCircle, Briefcase } from "lucide-react";
import type { User } from "@/types";
import { FadeIn } from "@/components/ui/animations";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { SuccessToast } from "@/components/ui/SuccessToast";
import { usersService } from "@/client/services";

const getUserBadge = (user: User) => {
  const memberType = user.memberType?.toLowerCase() || 'student';
  const role = user.role?.toLowerCase() || 'student';
  
  if (role === 'admin') {
    if (memberType === 'faculty') {
      return { label: "Admin:Faculty", color: "bg-purple-100 text-purple-700 border-purple-200" };
    }
    return { label: "Admin:Student", color: "bg-blue-100 text-blue-700 border-blue-200" };
  }
  
  if (memberType === 'faculty') {
    return { label: "User:Faculty", color: "bg-green-100 text-green-700 border-green-200" };
  }
  return { label: "User:Student", color: "bg-slate-100 text-slate-700 border-slate-200" };
};

export default function UserListPage() {
  const router = useRouter();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "student" | "faculty">("all");
  const [deleteUser, setDeleteUser] = useState<{ id: string; name: string } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [roleChange, setRoleChange] = useState<{ id: string; name: string; currentRole: string } | null>(null);
  const [actionType, setActionType] = useState<'promote' | 'demote' | null>(null);
  const [memberTypeChange, setMemberTypeChange] = useState<{ id: string; name: string; currentType: string } | null>(null);
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
    }
    if (!authLoading && currentUser && currentUser.role !== "admin") {
      router.push("/dashboard");
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await usersService.getAll();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.role === "admin") {
      fetchUsers();
    }
  }, [currentUser]);

  const confirmDelete = async () => {
    if (!deleteUser) return;
    try {
      await usersService.delete(deleteUser.id);
      setUsers(users.filter(u => u.uid !== deleteUser.id));
      setShowSuccess(true);
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleRoleChange = async () => {
    if (!roleChange || !actionType) return;
    try {
      const newRole = actionType === 'promote' ? 'admin' : 'user';
      await usersService.updateRole(roleChange.id, newRole);
      setUsers(users.map(u => u.uid === roleChange.id ? { ...u, role: newRole } : u));
      setShowSuccess(true);
      setRoleChange(null);
      setActionType(null);
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleMemberTypeChange = async () => {
    if (!memberTypeChange) return;
    if (memberTypeChange.currentType === 'Faculty' && !selectedYear) return;
    try {
      const newType = memberTypeChange.currentType === 'Faculty' ? 'Student' : 'Faculty';
      await usersService.updateMemberType(memberTypeChange.id, newType);
      setUsers(users.map(u => u.uid === memberTypeChange.id ? { ...u, memberType: newType, year: newType === 'Faculty' ? '' : selectedYear } : u));
      setShowSuccess(true);
      setMemberTypeChange(null);
      setSelectedYear("");
    } catch (error) {
      console.error("Failed to update member type:", error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterRole === "all" ||
      (filterRole === "admin" && user.role === "admin") ||
      (filterRole === "student" && user.memberType?.toLowerCase() === "student") ||
      (filterRole === "faculty" && user.memberType?.toLowerCase() === "faculty");

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === "admin").length,
    students: users.filter(u => u.memberType?.toLowerCase() === "student").length,
    faculty: users.filter(u => u.memberType?.toLowerCase() === "faculty").length,
  };

  if (authLoading || !currentUser || currentUser.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-10 md:py-14 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
        <div className="container-custom relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full w-fit mb-2">
                <Shield className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Admin Panel</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">User Management</h1>
              <p className="text-white/80 text-sm">View and manage all registered users</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-6 bg-white border-b">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-2xl md:text-3xl font-bold text-slate-800">{stats.total}</p>
              <p className="text-xs md:text-sm text-slate-500">Total Users</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-2xl md:text-3xl font-bold text-purple-600">{stats.admins}</p>
              <p className="text-xs md:text-sm text-purple-500">Admins</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-2xl md:text-3xl font-bold text-blue-600">{stats.students}</p>
              <p className="text-xs md:text-sm text-blue-500">Students</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-2xl md:text-3xl font-bold text-green-600">{stats.faculty}</p>
              <p className="text-xs md:text-sm text-green-500">Faculty</p>
            </div>
          </div>
        </div>
      </section>

      {/* Users List */}
      <section className="py-8 md:py-12 bg-slate-50">
        <div className="container-custom">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterRole("all")}
                className={cn("px-4 py-2 rounded-lg font-medium text-sm transition-colors", filterRole === "all" ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50")}
              >
                All
              </button>
              <button
                onClick={() => setFilterRole("admin")}
                className={cn("px-4 py-2 rounded-lg font-medium text-sm transition-colors", filterRole === "admin" ? "bg-purple-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50")}
              >
                Admins
              </button>
              <button
                onClick={() => setFilterRole("student")}
                className={cn("px-4 py-2 rounded-lg font-medium text-sm transition-colors", filterRole === "student" ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50")}
              >
                Students
              </button>
              <button
                onClick={() => setFilterRole("faculty")}
                className={cn("px-4 py-2 rounded-lg font-medium text-sm transition-colors", filterRole === "faculty" ? "bg-green-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50")}
              >
                Faculty
              </button>
            </div>
          </div>

          {/* Users Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                    <div className="flex-1"><div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div><div className="h-3 bg-slate-200 rounded w-1/2"></div></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user, index) => {
                const badge = getUserBadge(user);
                return (
                  <FadeIn key={user.uid} delay={index * 0.03}>
                    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all duration-300 group">
                      {/* Header with gradient */}
                      <div className={cn("relative px-5 pt-5 pb-4", 
                        user.role === "admin" ? "bg-gradient-to-br from-purple-500 to-indigo-600" : 
                        user.memberType === "Faculty" ? "bg-gradient-to-br from-emerald-500 to-teal-600" :
                        "bg-gradient-to-br from-blue-500 to-cyan-600"
                      )}>
                        {/* Pattern overlay */}
                        <div className="absolute inset-0 opacity-10" style={{backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 1px, transparent 1px)`, backgroundSize: '20px 20px'}} />
                        
                        <div className="relative flex items-center gap-4">
                          {/* Avatar with status ring */}
                          <div className="relative">
                            <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg",
                              user.role === "admin" ? "bg-white/20 backdrop-blur-sm" : "bg-white/25 backdrop-blur-sm"
                            )}>
                              {user.displayName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            {user.emailVerified && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center border-2 border-white">
                                <BadgeCheck className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          
                          {/* Name & Email */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white truncate">{user.displayName}</h3>
                            <p className="text-white/80 text-sm truncate">{user.email}</p>
                          </div>
                          
                          {/* Role Badge */}
                          <span className={cn("px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm",
                            user.role === "admin" ? "bg-white/30 text-white" : "bg-white/20 text-white/90"
                          )}>
                            {badge.label}
                          </span>
                        </div>
                      </div>
                      
                      {/* Body */}
                      <div className="p-5">
                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                          {user.branch && (
                            <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-lg">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Branch</p>
                                <p className="text-xs font-medium text-slate-700 truncate">{user.branch}</p>
                              </div>
                            </div>
                          )}
                          {user.year && (
                            <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-lg">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-purple-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Year</p>
                                <p className="text-xs font-medium text-slate-700">{user.year}</p>
                              </div>
                            </div>
                          )}
                          {user.phone && (
                            <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-lg">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <Phone className="w-4 h-4 text-green-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Phone</p>
                                <p className="text-xs font-medium text-slate-700 truncate">{user.phone}</p>
                              </div>
                            </div>
                          )}
                          {user.ieeeMemberId && (
                            <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-lg">
                              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                                <Shield className="w-4 h-4 text-amber-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">IEEE ID</p>
                                <p className="text-xs font-medium text-slate-700 truncate">{user.ieeeMemberId}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {user.uid !== currentUser.uid && currentUser.role === "admin" && (
                          <div className="flex flex-col sm:flex-row gap-2">
                            {/* Member Type Toggle */}
                            <button
                              onClick={() => setMemberTypeChange({ id: user.uid, name: user.displayName || user.email || 'Unknown User', currentType: user.memberType || 'Student' })}
                              className={cn("flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5",
                                user.memberType === 'Faculty' 
                                  ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" 
                                  : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                              )}
                            >
                              {user.memberType === 'Faculty' ? (
                                <>
                                  <Briefcase className="w-3.5 h-3.5" />
                                  To Student
                                </>
                              ) : (
                                <>
                                  <Shield className="w-3.5 h-3.5" />
                                  To Faculty
                                </>
                              )}
                            </button>
                            
                            {/* Role Toggle */}
                            <button
                              onClick={() => { 
                                const action = user.role === "admin" ? 'demote' : 'promote';
                                setRoleChange({ id: user.uid, name: user.displayName || user.email || 'Unknown User', currentRole: user.role }); 
                                setActionType(action); 
                              }}
                              className={cn("flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5",
                                user.role === "admin" 
                                  ? "bg-orange-50 text-orange-600 hover:bg-orange-100" 
                                  : "bg-violet-50 text-violet-600 hover:bg-violet-100"
                              )}
                            >
                              {user.role === "admin" ? (
                                <>
                                  <ArrowDownCircle className="w-3.5 h-3.5" />
                                  Demote
                                </>
                              ) : (
                                <>
                                  <ArrowUpCircle className="w-3.5 h-3.5" />
                                  Promote
                                </>
                              )}
                            </button>
                            
                            {/* Delete */}
                            <button
                              onClick={() => setDeleteUser({ id: user.uid, name: user.displayName || user.email || 'Unknown User' })}
                              className="py-2 px-3 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all flex items-center justify-center"
                            >
                              <span className="sr-only">Remove</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <UserIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-800 mb-1">No Users Found</h3>
              <p className="text-slate-500 text-sm">Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      </section>

      <Modal 
        isOpen={!!roleChange} 
        onClose={() => { setRoleChange(null); setActionType(null); }}
        title={actionType === 'promote' ? "Promote to Admin?" : "Demote to User?"}
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            {actionType === 'promote' 
              ? `${roleChange?.name} will gain full admin privileges and be able to manage events, members, and other users.`
              : `${roleChange?.name} will lose admin privileges and become a regular user.`}
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => { setRoleChange(null); setActionType(null); }}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange} className={actionType === 'promote' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-orange-600 hover:bg-orange-700'}>
              {actionType === 'promote' ? 'Promote' : 'Demote'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={!!memberTypeChange} 
        onClose={() => { setMemberTypeChange(null); setSelectedYear(""); }}
        title={memberTypeChange?.currentType === 'Faculty' ? "Change to Student?" : "Change to Faculty?"}
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            {memberTypeChange?.currentType === 'Faculty' 
              ? `${memberTypeChange?.name} will be changed to Student. Please select their year of study.`
              : `${memberTypeChange?.name} will be changed to Faculty. Year of study will be removed.`}
          </p>
          
          {memberTypeChange?.currentType === 'Faculty' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Year</label>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              >
                <option value="">Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          )}
          
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => { setMemberTypeChange(null); setSelectedYear(""); }}>
              Cancel
            </Button>
            <Button 
              onClick={handleMemberTypeChange} 
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={memberTypeChange?.currentType === 'Faculty' && !selectedYear}
            >
              {memberTypeChange?.currentType === 'Faculty' ? 'Change to Student' : 'Change to Faculty'}
            </Button>
          </div>
        </div>
      </Modal>
      
      <DeleteConfirmDialog 
        isOpen={!!deleteUser} 
        onClose={() => setDeleteUser(null)} 
        onConfirm={confirmDelete} 
        title="Remove User?" 
        message="This user will be permanently removed from the system." 
        itemName={deleteUser?.name} 
      />
      
      <SuccessToast message="User removed successfully!" isVisible={showSuccess} onClose={() => setShowSuccess(false)} />
      <Footer />
    </>
  );
}
