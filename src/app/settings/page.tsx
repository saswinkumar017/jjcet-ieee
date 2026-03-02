"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { User, Bell, Shield, ChevronRight, Check } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      setLoading(false);
      if (!user) {
        router.push("/login");
      }
    }
  }, [user, authLoading, router]);

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
      
      <div className="bg-background min-h-screen">
        <div className="container-custom py-8">
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted mt-2">Manage your account preferences</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="card p-4">
                <nav className="space-y-1">
                  <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-primary-light hover:text-primary transition-all">
                    <User className="w-5 h-5" />
                    Profile
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Link>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-light text-primary font-medium">
                    <Bell className="w-5 h-5" />
                    Notifications
                    <Check className="w-4 h-4 ml-auto" />
                  </div>
                  <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-primary-light hover:text-primary transition-all w-full">
                    <Shield className="w-5 h-5" />
                    Security
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </button>
                </nav>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-6">
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Account Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-muted">Name</span>
                    <span className="font-medium text-foreground">{user.displayName}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-muted">Email</span>
                    <span className="font-medium text-foreground">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-muted">Role</span>
                    <span className="font-medium text-primary capitalize">{user.role || "Student"}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-muted">Membership Status</span>
                    <span className="px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
