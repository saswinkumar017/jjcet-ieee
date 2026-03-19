"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  User, Bell, Shield, ChevronRight, Check, 
  BookOpen, Award, Phone, Mail, CreditCard, Edit3, 
  Camera, LogOut, Key, Eye, EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsTab = "profile" | "notifications" | "security";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Profile form
  const [formData, setFormData] = useState({
    displayName: "",
    phone: "",
    branch: "",
    year: "",
    ieeeMemberId: "",
  });

  useEffect(() => {
    if (!authLoading) {
      setLoading(false);
      if (!user) {
        router.push("/login");
      } else {
        setFormData({
          displayName: user.displayName || "",
          phone: user.phone || "",
          branch: user.branch || "",
          year: user.year || "",
          ieeeMemberId: user.ieeeMemberId || "",
        });
      }
    }
  }, [user, authLoading, router]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({
        displayName: formData.displayName,
        phone: formData.phone,
        branch: formData.branch,
        year: formData.year,
        ieeeMemberId: formData.ieeeMemberId,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Header />
      
      <div className="bg-background min-h-screen pb-12">
        <div className="container-custom py-8">
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted mt-2">Manage your account preferences and information</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card p-4">
                <nav className="space-y-1">
                  <button 
                    onClick={() => setActiveTab("profile")}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all",
                      activeTab === "profile" 
                        ? "bg-primary-light text-primary font-medium" 
                        : "text-muted hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <User className="w-5 h-5" />
                    Profile
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </button>
                  <button 
                    onClick={() => setActiveTab("notifications")}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all",
                      activeTab === "notifications" 
                        ? "bg-primary-light text-primary font-medium" 
                        : "text-muted hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <Bell className="w-5 h-5" />
                    Notifications
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </button>
                  <button 
                    onClick={() => setActiveTab("security")}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all",
                      activeTab === "security" 
                        ? "bg-primary-light text-primary font-medium" 
                        : "text-muted hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <Shield className="w-5 h-5" />
                    Security
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </button>
                  
                  <div className="pt-4 mt-4 border-t border-border">
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-red-500 hover:bg-red-50 transition-all"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </div>
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {activeTab === "profile" && (
                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Profile Information
                      </h2>
                    </div>
                    
                    {/* Avatar */}
                    <div className="flex items-center gap-6 mb-6 pb-6 border-b border-border">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-white text-2xl font-bold">
                            {user.displayName?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                        <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary-hover transition-colors">
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{user.displayName}</h3>
                        <p className="text-muted text-sm">{user.email}</p>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-light text-primary text-xs rounded-full mt-1">
                          {user.role === 'admin' ? 'Administrator' : 'Student Member'}
                        </span>
                      </div>
                    </div>

                    {/* Form */}
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          label="Full Name"
                          value={formData.displayName}
                          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                          placeholder="Enter your full name"
                        />
                        <Input
                          label="Phone Number"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Enter phone number"
                        />
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          label="Branch"
                          value={formData.branch}
                          onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                          placeholder="e.g., Computer Science"
                        />
                        {user.memberType !== 'Faculty' && (
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Year</label>
                            <select 
                              value={formData.year}
                              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            >
                              <option value="">Select Year</option>
                              <option value="1st Year">1st Year</option>
                              <option value="2nd Year">2nd Year</option>
                              <option value="3rd Year">3rd Year</option>
                              <option value="4th Year">4th Year</option>
                            </select>
                          </div>
                        )}
                      </div>

                      <Input
                        label="IEEE Member ID (Optional)"
                        value={formData.ieeeMemberId}
                        onChange={(e) => setFormData({ ...formData, ieeeMemberId: e.target.value })}
                        placeholder="Enter your IEEE membership ID"
                      />

                      <div className="flex items-center gap-3 pt-4">
                        <Button 
                          onClick={handleSaveProfile} 
                          disabled={saving}
                          variant="primary"
                        >
                          {saving ? "Saving..." : success ? "Saved!" : "Save Changes"}
                        </Button>
                        {success && (
                          <span className="text-green-600 text-sm flex items-center gap-1">
                            <Check className="w-4 h-4" /> Profile updated successfully
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Account Info */}
                  <div className="card p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Account Information
                    </h2>
                    <div className="space-y-0">
                      <div className="flex items-center justify-between py-3 border-b border-border">
                        <span className="text-muted flex items-center gap-2"><Mail className="w-4 h-4" /> Email</span>
                        <span className="font-medium text-foreground">{user.email}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-border">
                        <span className="text-muted flex items-center gap-2"><Award className="w-4 h-4" /> Role</span>
                        <span className="font-medium text-primary capitalize">{user.role || "Student"}</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-muted flex items-center gap-2"><Check className="w-4 h-4" /> Status</span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="card p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Notification Preferences
                  </h2>
                  <div className="space-y-4">
                    {[
                      { id: "events", label: "Event Updates", desc: "Get notified about new events and registrations" },
                      { id: "announcements", label: "Announcements", desc: "Receive important announcements and notices" },
                      { id: "gallery", label: "Gallery Updates", desc: "When new photos are added to the gallery" },
                      { id: "members", label: "Member Updates", desc: "New member joining notifications" },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                        <div>
                          <p className="font-medium text-foreground">{item.label}</p>
                          <p className="text-sm text-muted">{item.desc}</p>
                        </div>
                        <button className="w-12 h-6 bg-primary rounded-full relative transition-colors">
                          <span className="absolute top-1 left-7 w-4 h-4 bg-white rounded-full transition-transform" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <div className="card p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                      <Key className="w-5 h-5 text-primary" />
                      Security Options
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Key className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Change Password</p>
                            <p className="text-sm text-muted">Update your account password</p>
                          </div>
                        </div>
                        <Button variant="outline" onClick={() => router.push("/forgot-password")}>
                          Update
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Two-Factor Authentication</p>
                            <p className="text-sm text-muted">Add an extra layer of security</p>
                          </div>
                        </div>
                        <Button variant="outline">Enable</Button>
                      </div>
                    </div>
                  </div>

                  <div className="card p-6 border-red-200 bg-red-50">
                    <h2 className="text-xl font-semibold text-red-600 mb-4 flex items-center gap-2">
                      <LogOut className="w-5 h-5" />
                      Danger Zone
                    </h2>
                    <p className="text-muted mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                    <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-100">
                      Delete Account
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
