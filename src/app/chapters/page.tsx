"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Plus, Edit, Trash2, ArrowRight, X, MoreVertical
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { chaptersService, driveService } from "@/client/services";
import { useAuth } from "@/lib/AuthContext";
import { Chapter } from "@/types";
import { FadeIn } from "@/components/ui/animations";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { SuccessToast } from "@/components/ui/SuccessToast";

interface ChapterFormData {
  name: string;
  description: string;
  logoUrl: string;
}

const initialFormData: ChapterFormData = {
  name: "",
  description: "",
  logoUrl: "",
};

function ChaptersContent() {
  const { user } = useAuth();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [formData, setFormData] = useState<ChapterFormData>(initialFormData);
  const [deleteItem, setDeleteItem] = useState<{id: string; name: string} | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [driveImages, setDriveImages] = useState<any[]>([]);
  const [loadingDriveImages, setLoadingDriveImages] = useState(false);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const data = await chaptersService.getAll();
        setChapters(data);
      } catch (error) {
        console.error("Failed to fetch chapters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  const openCreateModal = () => {
    setEditingChapter(null);
    setFormData(initialFormData);
    setPreviewUrl("");
    setShowModal(true);
  };

  const openEditModal = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setFormData({
      name: chapter.name,
      description: chapter.description,
      logoUrl: chapter.logoUrl || "",
    });
    setPreviewUrl(chapter.logoUrl || "");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingChapter(null);
    setFormData(initialFormData);
    setPreviewUrl("");
    setFormError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl("");
    }
  };

  const handleDriveImageSelect = (image: any) => {
    setFormData({ ...formData, logoUrl: image.thumbnailLink || image.url });
    setPreviewUrl(image.thumbnailLink || image.url);
    setShowDriveModal(false);
  };

  const openDrivePicker = async () => {
    setLoadingDriveImages(true);
    setShowDriveModal(true);
    try {
      const images = await driveService.getImages('chapters');
      setDriveImages(images);
    } catch (error) {
      console.error("Failed to fetch Drive images:", error);
    } finally {
      setLoadingDriveImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Chapter name is required");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const fileInput = document.getElementById('logo-file') as HTMLInputElement;
      const file = fileInput?.files?.[0];

      if (editingChapter) {
        if (file) {
          await chaptersService.updateWithFile(editingChapter.id, {
            name: formData.name,
            description: formData.description,
          }, file);
        } else {
          await chaptersService.update(editingChapter.id, {
            name: formData.name,
            description: formData.description,
            logoUrl: formData.logoUrl,
          });
        }
      } else {
        if (file) {
          await chaptersService.createWithFile({
            name: formData.name,
            description: formData.description,
          }, file);
        } else {
          await chaptersService.create({
            name: formData.name,
            description: formData.description,
            logoUrl: formData.logoUrl,
          });
        }
      }

      const updatedChapters = await chaptersService.getAll();
      setChapters(updatedChapters);
      setShowSuccess(true);
      closeModal();
    } catch (error) {
      console.error("Failed to save chapter:", error);
      setFormError("Failed to save chapter. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    
    try {
      await chaptersService.delete(deleteItem.id);
      const updatedChapters = await chaptersService.getAll();
      setChapters(updatedChapters);
      setDeleteItem(null);
      setShowSuccess(true);
    } catch (error) {
      console.error("Failed to delete chapter:", error);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="relative bg-gradient-to-r from-primary via-primary-dark to-primary bg-texture">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
          <div className="relative px-6 md:px-8 lg:px-12 py-16 md:py-20">
            <FadeIn>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto text-center"
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Chapters</h1>
                <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                  Explore our IEEE chapters and join a community of innovators
                </p>
              </motion.div>
            </FadeIn>
          </div>
        </div>

        <div className="px-6 md:px-8 lg:px-12 py-12">
          <div className="max-w-7xl mx-auto">
            {user?.role === "admin" && (
              <div className="flex justify-end mb-6">
                <Button onClick={openCreateModal} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Chapter
                </Button>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              </div>
            ) : chapters.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No chapters found. {user?.role === "admin" && "Create one to get started!"}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {chapters.map((chapter, index) => (
                  <FadeIn key={chapter.id} delay={index * 0.1}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
                    >
                      <div className="aspect-video relative overflow-hidden bg-gray-100">
                        {chapter.logoUrl ? (
                          <img src={chapter.logoUrl} alt={chapter.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                            <span className="text-4xl font-bold text-primary/30">{chapter.name.charAt(0)}</span>
                          </div>
                        )}
                        {user?.role === "admin" && (
                          <div className="absolute top-3 right-3">
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === chapter.id ? null : chapter.id);
                                }}
                                className="p-2 bg-white/90 rounded-lg shadow-md hover:bg-white transition-colors"
                              >
                                <MoreVertical className="w-4 h-4 text-gray-600" />
                              </button>
                              {openMenuId === chapter.id && (
                                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl py-1 min-w-[120px] z-30 border">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      openEditModal(chapter);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Edit className="w-4 h-4" /> Edit
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setDeleteItem({ id: chapter.id, name: chapter.name });
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-4 h-4" /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <Link href={`/chapters/${chapter.id}`} className="block p-5">
                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{chapter.name}</h3>
                        <p className="text-sm text-muted line-clamp-2">{chapter.description}</p>
                        <div className="mt-4 flex items-center text-primary font-medium">
                          View Details <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      </Link>
                    </motion.div>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editingChapter ? "Edit Chapter" : "Add New Chapter"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Chapter Name"
            placeholder="Enter chapter name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Textarea
            label="Description"
            placeholder="Enter chapter description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Chapter Logo</label>
            <div className="flex gap-3">
              <input
                type="file"
                id="logo-file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button type="button" variant="secondary" onClick={openDrivePicker}>
                Choose from Drive
              </Button>
            </div>
            {previewUrl && (
              <div className="mt-3 relative aspect-video max-w-xs rounded-lg overflow-hidden bg-gray-100">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl("");
                    setFormData({ ...formData, logoUrl: "" });
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {formError && (
            <p className="text-sm text-red-600">{formError}</p>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={closeModal} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingChapter ? "Update Chapter" : "Create Chapter"}
            </Button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={confirmDelete} title="Delete Chapter?" message="This chapter and all its members will be permanently deleted." itemName={deleteItem?.name} />
      
      {/* Drive Picker */}
      <Modal isOpen={showDriveModal} onClose={() => setShowDriveModal(false)} title="Choose Image" size="full">
        {loadingDriveImages ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div></div>
        ) : driveImages.length === 0 ? (
          <div className="text-center py-12"><p className="text-gray-500">No images found</p></div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 min-h-[400px] max-h-[70vh] overflow-y-auto p-4">
            {driveImages.map((image) => (
              <div key={image.id} onClick={() => handleDriveImageSelect(image)} className="aspect-square relative rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary">
                <img src={image.thumbnailLink || image.url} alt={image.name} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </Modal>
      
      <SuccessToast message="Chapter saved successfully!" isVisible={showSuccess} onClose={() => setShowSuccess(false)} />
      <Footer />
    </>
  );
}

export default function ChaptersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    }>
      <ChaptersContent />
    </Suspense>
  );
}
