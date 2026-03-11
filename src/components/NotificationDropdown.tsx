"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { notificationsService } from "@/client/services";
import { Notification } from "@/types";
import { useAuth } from "@/lib/AuthContext";

interface NotificationDropdownProps {
  onClose?: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export default function NotificationDropdown({ onClose, onUnreadCountChange }: NotificationDropdownProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user?.uid) return;
    setError(null);
    try {
      const data = await notificationsService.getAll(user.uid, 0, 5);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    if (!user?.uid) return;
    try {
      await notificationsService.markAsRead(user.uid, id);
      const newCount = Math.max(0, unreadCount - 1);
      setUnreadCount(newCount);
      onUnreadCountChange?.(newCount);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true, readBy: [...(n.readBy || []), user.uid] } : n)
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.uid) return;
    try {
      await notificationsService.markAllAsRead(user.uid);
      setUnreadCount(0);
      onUnreadCountChange?.(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readBy: [...(n.readBy || []), user.uid!] })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    if (!user?.uid) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      await notificationsService.delete(user.uid, id);
      const wasUnread = notifications.find(n => n.id === id && !n.isRead && !n.readBy?.includes(user.uid));
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (wasUnread) {
        const newCount = Math.max(0, unreadCount - 1);
        setUnreadCount(newCount);
        onUnreadCountChange?.(newCount);
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleClearAll = async () => {
    if (!user?.uid) return;
    try {
      await notificationsService.deleteAll(user.uid);
      setNotifications([]);
      setUnreadCount(0);
      onUnreadCountChange?.(0);
    } catch (error) {
      console.error("Failed to clear all notifications:", error);
    }
  };

  const isNotificationRead = (notification: Notification) => {
    if (!user?.uid) return notification.isRead;
    return notification.isRead || notification.readBy?.includes(user.uid);
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

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!user) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in-down origin-top-right z-50"
    >
      <div className="px-5 py-4 bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-800">Notifications</h3>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              Clear all
            </button>
          )}
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="text-xs text-primary hover:text-primary-dark font-medium"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No notifications yet</div>
        ) : (
          notifications.map((notification) => {
              const isRead = isNotificationRead(notification);
              return (
            <div
              key={notification.id}
              className={cn(
                "px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors",
                !isRead && "bg-violet-50/50"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{getTypeIcon(notification.type)}</span>
                <div className="flex-1 min-w-0">
                  <Link
                    href={notification.referenceUrl}
                    className="block"
                    onClick={() => {
                      if (!isRead) {
                        handleMarkAsRead(notification.id);
                      }
                      onClose?.();
                    }}
                  >
                    <p className={cn(
                      "text-sm font-medium truncate",
                      !isRead && "text-gray-900"
                    )}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatTime(notification.createdAt)}</p>
                  </Link>
                </div>
                <button
                  onClick={(e) => handleDelete(notification.id, e)}
                  className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete notification"
                >
                  <X className="w-4 h-4" />
                </button>
                {!isRead && (
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                )}
              </div>
            </div>
              );
            })
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <Link
          href="/notifications"
          className="block text-center text-sm text-primary font-medium hover:text-primary-dark"
          onClick={onClose}
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
}
