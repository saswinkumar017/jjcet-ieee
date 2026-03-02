"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/AuthContext";
import { announcementsService } from "@/client/services";
import { Announcement } from "@/types";
import { Bell, Calendar, Edit, Trash2, Plus, AlertTriangle, Info, ChevronRight, X, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { SuccessToast } from "@/components/ui/SuccessToast";

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({ title: "", content: "", priority: "normal" as "high" | "normal" });
  const [saving, setSaving] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{id: string; name: string} | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await announcementsService.getAll();
        setAnnouncements(data);
      } catch (error) {
        console.error("Failed to fetch announcements", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingAnnouncement) {
        await announcementsService.update(editingAnnouncement.id, formData);
        setAnnouncements(announcements.map(a => 
          a.id === editingAnnouncement.id ? { ...a, ...formData } : a
        ));
      } else {
        const id = await announcementsService.create(formData);
        setAnnouncements([{ id, ...formData, createdAt: new Date() }, ...announcements]);
      }
      setShowModal(false);
      setEditingAnnouncement(null);
      setFormData({ title: "", content: "", priority: "normal" });
    } catch (error) {
      console.error("Failed to save announcement", error);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    try {
      await announcementsService.delete(deleteItem.id);
      setAnnouncements(announcements.filter(a => a.id !== deleteItem.id));
      setShowSuccess(true);
    } catch (error) {
      console.error("Failed to delete announcement", error);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteItem({ id, name });
  };

  const openEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({ title: announcement.title, content: announcement.content, priority: announcement.priority });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditingAnnouncement(null);
    setFormData({ title: "", content: "", priority: "normal" });
    setShowModal(true);
  };

  return (
    <>
      <Header />
      
      <div className="bg-background min-h-screen">
        <div className="container-custom py-12">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8 animate-fade-in-up">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Announcements</h1>
              <p className="text-muted mt-2">Stay updated with latest announcements</p>
            </div>
            {user?.role === "admin" && (
              <button
                onClick={openCreate}
                className="inline-flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                Add Announcement
              </button>
            )}
          </div>

          {/* Announcements List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-20 animate-fade-in-up">
              <div className="w-20 h-20 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">No Announcements Yet</h2>
              <p className="text-muted mt-2">Check back later for updates</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement, index) => (
                <div
                  key={announcement.id}
                  className="card p-6 animate-fade-in-up hover:shadow-lg transition-all"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                      announcement.priority === "high" 
                        ? "bg-red-100bg-red-900/30" 
                        : "bg-primary-lightbg-primary/20"
                    )}>
                      {announcement.priority === "high" ? (
                        <AlertTriangle className="w-6 h-6 text-red-600text-red-400" />
                      ) : (
                        <Info className="w-6 h-6 text-primarytext-primary-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {announcement.title}
                          </h3>
                          <p className="text-muted mt-2 whitespace-pre-wrap">
                            {announcement.content}
                          </p>
                        </div>
                        
                        {user?.role === "admin" && (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => openEdit(announcement)}
                              className="p-2 text-muted hover:text-primary hover:bg-primary-light rounded-lg transition-all"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(announcement.id, announcement.title)}
                              className="p-2 text-muted hover:text-error hover:bg-error/10 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mt-4 text-sm text-muted">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </span>
                        {announcement.priority === "high" && (
                          <span className="px-2 py-0.5 bg-red-100bg-red-900/30 text-red-600text-red-400 text-xs rounded-full">
                            Important
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingAnnouncement ? "Edit Announcement" : "New Announcement"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as "high" | "normal" })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-all disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingAnnouncement ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={confirmDelete}
        title="Delete Announcement?"
        message="This announcement will be permanently deleted. This action cannot be undone."
        itemName={deleteItem?.name}
      />

      <SuccessToast
        message="Deleted successfully"
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
      />

      <Footer />
    </>
  );
}
