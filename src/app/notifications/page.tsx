"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/AuthContext";
import { notificationsService } from "@/client/services";
import { Notification } from "@/types";
import { Bell, Check, Trash2, Loader2, X } from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user?.uid) return;
    try {
      const data = await notificationsService.getAll(user.uid, 0, 50);
      setNotifications(data.notifications);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    if (!user?.uid) return;
    try {
      await notificationsService.markAsRead(user.uid, id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true, readBy: [...(n.readBy || []), user.uid] } : n)
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.uid) return;
    setMarkingAllRead(true);
    try {
      await notificationsService.markAllAsRead(user.uid);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readBy: [...(n.readBy || []), user.uid!] })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    if (!user?.uid) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      await notificationsService.delete(user.uid, id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleClearAll = async () => {
    if (!user?.uid) return;
    if (!confirm("Are you sure you want to clear all notifications?")) return;
    try {
      await notificationsService.deleteAll(user.uid);
      setNotifications([]);
    } catch (error) {
      console.error("Failed to clear all notifications:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "announcement":
        return "📢";
      case "event":
        return "📅";
      case "news":
        return "📰";
      case "gallery":
        return "🖼️";
      default:
        return "🔔";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "announcement":
        return "Announcement";
      case "event":
        return "Event";
      case "news":
        return "News";
      case "gallery":
        return "Gallery";
      default:
        return "Notification";
    }
  };

  const isNotificationRead = (notification: Notification) => {
    if (!user?.uid) return notification.isRead;
    return notification.isRead || notification.readBy?.includes(user.uid);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return new Date(date).toLocaleDateString();
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Please login to view notifications</h2>
            <Link href="/login" className="text-primary hover:underline mt-2 inline-block">
              Login here
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 mt-1">Stay updated with latest announcements</p>
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear all
                  </button>
                )}
                {notifications.some(n => !n.isRead) && (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={markingAllRead}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                  >
                    {markingAllRead ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                <p className="text-gray-600 mt-4">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900">No notifications yet</h3>
                <p className="text-gray-600 mt-2">You will receive notifications when new content is posted</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {notifications.map((notification, index) => {
                  const isRead = isNotificationRead(notification);
                  return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-5 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      !isRead ? "bg-blue-50/50" : ""
                    } ${index === notifications.length - 1 ? "border-b-0" : ""}`}
                  >
                    <Link
                      href={notification.referenceUrl}
                      onClick={() => !isRead && handleMarkAsRead(notification.id)}
                      className="flex-1 flex items-start gap-4"
                    >
                      <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {getTypeLabel(notification.type)}
                          </span>
                          {!isRead && (
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                          )}
                        </div>
                        <h3 className={`font-semibold mt-1 ${isRead ? "text-gray-700" : "text-gray-900"}`}>
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 text-sm mt-0.5 line-clamp-2">{notification.message}</p>
                        <p className="text-gray-400 text-xs mt-2">{formatDate(notification.createdAt)}</p>
                      </div>
                    </Link>
                    <button
                      onClick={(e) => handleDelete(notification.id, e)}
                      className="p-2 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
