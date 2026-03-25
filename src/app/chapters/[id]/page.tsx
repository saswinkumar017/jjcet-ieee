"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Plus, Edit, Trash2, ArrowLeft, X, MoreVertical, Mail, Linkedin
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { chaptersService, chapterMembersService, driveService } from "@/client/services";
import { useAuth } from "@/lib/AuthContext";
import { Chapter, ChapterMember } from "@/types";
import { FadeIn } from "@/components/ui/animations";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { SuccessToast } from "@/components/ui/SuccessToast";

interface MemberFormData {
  name: string;
  role: string;
  photoUrl: string;
  email: string;
  linkedin: string;
  order: number;
}

const initialFormData: MemberFormData = {
  name: "",
  role: "",
  photoUrl: "",
  email: "",
  linkedin: "",
  order: 0,
};

function ChapterDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const chapterId = params.id as string;
  
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [members, setMembers] = useState<ChapterMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<ChapterMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [formData, setFormData] = useState<MemberFormData>(initialFormData);
  const [deleteItem, setDeleteItem] = useState<{id: string; name: string} | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [driveImages, setDriveImages] = useState<any[]>([]);
  const [loadingDriveImages, setLoadingDriveImages] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chapterData, membersData] = await Promise.all([
          chaptersService.getById(chapterId),
          chapterMembersService.getByChapterId(chapterId),
        ]);
        setChapter(chapterData);
        setMembers(membersData);
      } catch (error) {
        console.error("Failed to fetch chapter:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [chapterId]);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  const openCreateModal = () => {
    setEditingMember(null);
    setFormData(initialFormData);
    setPreviewUrl("");
    setShowModal(true);
  };

  const openEditModal = (member: ChapterMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      photoUrl: member.photoUrl,
      email: member.email,
      linkedin: member.linkedin || "",
      order: member.order,
    });
    setPreviewUrl(member.photoUrl);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMember(null);
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
    }
  };

  const handleDriveImageSelect = (image: any) => {
    setFormData({ ...formData, photoUrl: image.thumbnailLink || image.url });
    setPreviewUrl(image.thumbnailLink || image.url);
    setShowDriveModal(false);
  };

  const openDrivePicker = async () => {
    setLoadingDriveImages(true);
    setShowDriveModal(true);
    try {
      const images = await driveService.getImages('chapter_members');
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
      setFormError("Name is required");
      return;
    }
    if (!formData.role.trim()) {
      setFormError("Role is required");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const fileInput = document.getElementById('photo-file') as HTMLInputElement;
      const file = fileInput?.files?.[0];

      const memberData = {
        chapterId,
        name: formData.name,
        role: formData.role,
        photoUrl: formData.photoUrl,
        email: formData.email,
        linkedin: formData.linkedin,
        order: formData.order,
      };

      if (editingMember) {
        if (file) {
          await chapterMembersService.updateWithFile(editingMember.id, memberData, file);
        } else {
          await chapterMembersService.update(editingMember.id, memberData);
        }
      } else {
        if (file) {
          await chapterMembersService.createWithFile(memberData, file);
        } else {
          await chapterMembersService.create(memberData);
        }
      }

      const updatedMembers = await chapterMembersService.getByChapterId(chapterId);
      setMembers(updatedMembers);
      setShowSuccess(true);
      closeModal();
    } catch (error) {
      console.error("Failed to save member:", error);
      setFormError("Failed to save member. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    
    try {
      await chapterMembersService.delete(deleteItem.id);
      const updatedMembers = await chapterMembersService.getByChapterId(chapterId);
      setMembers(updatedMembers);
      setDeleteItem(null);
      setShowSuccess(true);
    } catch (error) {
      console.error("Failed to delete member:", error);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (!chapter) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 text-lg mb-4">Chapter not found</p>
            <Link href="/chapters" className="text-primary hover:underline">Back to Chapters</Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-primary via-primary-dark to-primary">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
          <div className="relative px-6 md:px-8 lg:px-12 py-16 md:py-20">
            <FadeIn>
              <motion.div className="max-w-7xl mx-auto">
                <Link href="/chapters" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Chapters
                </Link>
                
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  {chapter.logoUrl ? (
                    <img src={chapter.logoUrl} alt={chapter.name} className="w-32 h-32 md:w-48 md:h-48 object-contain rounded-2xl bg-white p-2 shadow-lg" />
                  ) : (
                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg">
                      <span className="text-5xl md:text-6xl font-bold text-white/50">{chapter.name.charAt(0)}</span>
                    </div>
                  )}
                  
                  <div className="text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{chapter.name}</h1>
                    <p className="text-lg text-white/80 max-w-2xl">{chapter.description}</p>
                  </div>
                </div>
              </motion.div>
            </FadeIn>
          </div>
        </div>

        {/* Members Section */}
        <div className="px-6 md:px-8 lg:px-12 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">Chapter Members</h2>
              {user?.role === "admin" && (
                <Button onClick={openCreateModal} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Member
                </Button>
              )}
            </div>

            {members.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                <p className="text-gray-500 text-lg">No members yet. {user?.role === "admin" && "Add members to get started!"}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {members.map((member, index) => (
                  <FadeIn key={member.id} delay={index * 0.05}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
                    >
                      <div className="aspect-square relative overflow-hidden bg-gray-100">
                        {member.photoUrl ? (
                          <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                            <span className="text-4xl font-bold text-primary/30">{member.name.charAt(0)}</span>
                          </div>
                        )}
                        {user?.role === "admin" && (
                          <div className="absolute top-3 right-3">
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === member.id ? null : member.id);
                                }}
                                className="p-2 bg-white/90 rounded-lg shadow-md hover:bg-white transition-colors"
                              >
                                <MoreVertical className="w-4 h-4 text-gray-600" />
                              </button>
                              {openMenuId === member.id && (
                                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl py-1 min-w-[120px] z-30 border">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      openEditModal(member);
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
                                      setDeleteItem({ id: member.id, name: member.name });
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
                      <div className="p-4 text-center">
                        <h3 className="font-bold text-foreground mb-1">{member.name}</h3>
                        <p className="text-sm text-primary font-medium mb-2">{member.role}</p>
                        <div className="flex justify-center gap-3">
                          {member.email && (
                            <a href={`mailto:${member.email}`} className="p-2 text-gray-400 hover:text-primary transition-colors rounded-full hover:bg-gray-100">
                              <Mail className="w-4 h-4" />
                            </a>
                          )}
                          {member.linkedin && (
                            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-primary transition-colors rounded-full hover:bg-gray-100">
                              <Linkedin className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editingMember ? "Edit Member" : "Add New Member"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            placeholder="Enter member name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Role"
            placeholder="e.g., Chairperson, Secretary"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
          />

          <Input
            label="Display Order"
            type="number"
            placeholder="0"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Photo</label>
            <div className="flex gap-3">
              <input
                type="file"
                id="photo-file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
             
              <Button type="button" variant="secondary" onClick={openDrivePicker}>
                Choose from Drive
              </Button>
            </div>
            {previewUrl && (
              <div className="mt-3 relative aspect-square max-w-xs rounded-lg overflow-hidden bg-gray-100">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl("");
                    setFormData({ ...formData, photoUrl: "" });
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
              {isSubmitting ? "Saving..." : editingMember ? "Update Member" : "Add Member"}
            </Button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={confirmDelete} title="Delete Member?" message="This member will be permanently removed from the chapter." itemName={deleteItem?.name} />
      
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
      
      <SuccessToast message="Member saved successfully!" isVisible={showSuccess} onClose={() => setShowSuccess(false)} />
      <Footer />
    </>
  );
}

export default function ChapterDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    }>
      <ChapterDetailContent />
    </Suspense>
  );
}
