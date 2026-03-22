"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Edit, Trash2, Mail, Linkedin, Instagram, FolderOpen, Image, MoreVertical } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { membersService } from "@/client/services";
import { useAuth } from "@/lib/AuthContext";
import { TeamMember, DriveImage } from "@/types";
import { FadeIn } from "@/components/ui/animations";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { SuccessToast } from "@/components/ui/SuccessToast";

interface MemberCardProps {
  member: TeamMember;
  index: number;
  isAdmin: boolean;
  onEdit: (member: TeamMember) => void;
  onDelete: (id: string, name: string) => void;
  isLarge?: boolean;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
}

function MemberCard({ member, index, isAdmin, onEdit, onDelete, isLarge, openMenuId, setOpenMenuId }: MemberCardProps) {
  const [showDescription, setShowDescription] = useState(false);
  const isFaculty = member.memberType === "faculty";
  const hasDescription = isFaculty && member.description;

  return (
    <FadeIn key={member.id} delay={index * 0.05}>
      <motion.div whileHover={{ y: -5 }}
        className="group bg-surface rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all"
      >
        <div className="relative" onClick={() => hasDescription && setShowDescription(!showDescription)}>
          <div className={`aspect-[3/4] ${isLarge ? 'w-64 md:w-72' : 'w-32 sm:w-36 md:w-40'} flex-shrink-0`}>
            {member.photoUrl ? (
              <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <Users className="w-12 h-12 text-primary/30" />
              </div>
            )}
          </div>
          {isAdmin && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all z-20">
              <div className="relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === member.id ? null : member.id); }}
                  className="p-2 bg-white/95 hover:bg-slate-100 text-slate-600 rounded-lg shadow-lg transition-all"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {openMenuId === member.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 py-1 min-w-[120px] z-30">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(member); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(member.id, member.name); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          {hasDescription && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none lg:pointer-events-auto">
              <p className="text-white text-sm text-center leading-relaxed">{member.description}</p>
            </div>
          )}
        </div>
        <div className="p-4 text-center">
          <h3 className="font-bold text-sm text-foreground">{member.name}</h3>
          <p className="text-primary font-medium text-xs mb-2">{member.role}</p>
          <div className="flex justify-center gap-1">
            {member.email && <a href={`mailto:${member.email}`} className="p-1.5 bg-muted/20 rounded-lg hover:bg-primary-light transition-all"><Mail className="w-3 h-3" /></a>}
          </div>
        </div>
      </motion.div>
    </FadeIn>
  );
}

export default function MembersPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    photoUrl: "",
    linkedin: "",
    order: 0,
    memberType: "student" as "faculty" | "student",
    description: "",
  });
  const [deleteItem, setDeleteItem] = useState<{id: string; name: string} | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  // Drive image selection
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [driveImages, setDriveImages] = useState<DriveImage[]>([]);
  const [loadingDriveImages, setLoadingDriveImages] = useState(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memoized filtering to prevent re-rendering on form input changes
  const facultyMembers = useMemo(() => 
    members.filter(m => m.memberType === "faculty"), 
  [members]);
  const studentMembers = useMemo(() => 
    members.filter(m => m.memberType !== "faculty"), 
  [members]);

  // Fetch images from Drive for member photo selection
  const openDrivePicker = async () => {
    setShowDriveModal(true);
    setLoadingDriveImages(true);
    try {
      const { getMemberImages } = await import('@/lib/drive');
      const images = await getMemberImages();
      setDriveImages(images);
    } catch (error) {
      console.error('Failed to load Drive images:', error);
    } finally {
      setLoadingDriveImages(false);
    }
  };

  // Select image from Drive
  const handleDriveImageSelect = (image: DriveImage) => {
    // Store the thumbnailLink (direct image URL) for display in Firestore
    // The thumbnailLink is /api/drive?action=image&fileId=XXX which works as img src
    const imageUrl = image.thumbnailLink || image.webViewLink;
    setPreviewPhotoUrl(image.thumbnailLink || imageUrl);
    setFormData({ ...formData, photoUrl: imageUrl });
    setShowDriveModal(false);
  };

  // Handle local file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewPhotoUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await membersService.getAll();
        setMembers(data.sort((a, b) => a.order - b.order));
      } catch (error) {
        console.error("Failed to fetch members:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await membersService.update(editingMember.id, formData);
      } else {
        await membersService.create(formData as any);
      }
      const updated = await membersService.getAll();
      setMembers(updated.sort((a, b) => a.order - b.order));
      closeModal();
    } catch (error) {
      console.error("Failed to save member:", error);
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    try {
      await membersService.delete(deleteItem.id);
      const updated = await membersService.getAll();
      setMembers(updated.sort((a, b) => a.order - b.order));
      setShowSuccess(true);
    } catch (error) {
      console.error("Failed to delete member:", error);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteItem({ id, name });
  };

  const openCreate = () => {
    setEditingMember(null);
    const facultyCount = members.filter(m => m.memberType === "faculty").length;
    const studentCount = members.filter(m => m.memberType !== "faculty").length;
    setFormData({ name: "", role: "", email: "", photoUrl: "", linkedin: "", order: studentCount + 1, memberType: "student", description: "" });
    setShowModal(true);
  };

  const openEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      email: member.email || "",
      photoUrl: member.photoUrl || "",
      linkedin: member.linkedin || "",
      order: member.order,
      memberType: member.memberType || "student",
      description: member.description || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMember(null);
  };

  return (
    <>
      <Header />

      <section className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700 text-white py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10" 
          style={{ backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 1px, transparent 1px)`, backgroundSize: '50px 50px' }} 
        />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-[100px]"></div>
        
        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full w-fit">
                <Users className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Our Members</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">Members</h1>
              <p className="text-white/90 max-w-xl">Meet the dedicated team behind JJCET IEEE Student Branch.</p>
            </div>
            {user?.role === "admin" && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openCreate}
                className="inline-flex items-center justify-center gap-2 bg-accent text-foreground px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:shadow-lg hover:-translate-y-0.5 shrink-0"
              >
                <Plus className="w-4 h-4" /> Add Member
              </motion.button>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-backgroundbg-slate-900">
        <div className="container-custom">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[1,2,3,4,5,6,7,8,9,10,11,12].map((i) => (
                <div key={i} className="bg-surface rounded-2xl border border-border p-3 text-center">
                  <div className="w-full aspect-[4/5] mx-auto bg-muted/20 rounded-2xl animate-pulse mb-3" />
                  <div className="h-4 bg-muted/20 rounded w-2/3 mx-auto mb-2" />
                  <div className="h-3 bg-muted/20 rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : members.length > 0 ? (
            <>
              {facultyMembers.length > 0 && (
                <div className="mb-16">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-1 h-8 bg-primary rounded-full"></div>
                    <h2 className="text-2xl font-bold text-foreground">Faculty Members</h2>
                  </div>
                  <div className="flex flex-col md:flex-row md:flex-wrap gap-24 justify-center items-center md:items-start">
                    {facultyMembers.map((member, index) => (
                      <MemberCard 
                        key={member.id} 
                        member={member} 
                        index={index} 
                        isAdmin={user?.role === "admin"}
                        onEdit={openEdit}
                        onDelete={handleDeleteClick}
                        isLarge
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                      />
                    ))}
                  </div>
                </div>
              )}
              {studentMembers.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-1 h-8 bg-accent rounded-full"></div>
                    <h2 className="text-2xl font-bold text-foreground">Student Members</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 justify-items-center">
                    {studentMembers.map((member, index) => (
                      <MemberCard 
                        key={member.id} 
                        member={member} 
                        index={index} 
                        isAdmin={user?.role === "admin"}
                        onEdit={openEdit}
                        onDelete={handleDeleteClick}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Members</h3>
              <p className="text-muted">Add team members to showcase</p>
            </div>
          )}
        </div>
      </section>

      <Modal isOpen={showModal} onClose={closeModal} title={editingMember ? "Edit Member" : "Add Member"} size="2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Name" placeholder="Enter name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <Input label="Role" placeholder="e.g., Chair, Vice Chair" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Email" type="email" placeholder="Enter email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <div>
              <Input 
                label="Photo URL" 
                placeholder="Enter photo URL or choose from Drive" 
                value={formData.photoUrl} 
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })} 
              />
              <button 
                type="button"
                onClick={openDrivePicker}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <FolderOpen className="w-4 h-4" /> Choose from Google Drive
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Display Order" type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })} />
            <Select 
              label="Member Type" 
              value={formData.memberType} 
              onChange={(e) => {
                const newType = e.target.value as "faculty" | "student";
                const count = newType === "faculty" 
                  ? members.filter(m => m.memberType === "faculty").length 
                  : members.filter(m => m.memberType !== "faculty").length;
                setFormData({ ...formData, memberType: newType, order: count + 1 });
              }}
              options={[
                { value: "student", label: "Student" },
                { value: "faculty", label: "Faculty" },
              ]}
            />
          </div>
          {formData.memberType === "faculty" && (
            <Textarea 
              label="Description (About)" 
              placeholder="Enter a short description about the faculty member..." 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              rows={3} 
            />
          )}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={closeModal} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1">{editingMember ? "Update" : "Add"}</Button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={confirmDelete}
        title="Delete Member?"
        message="This member will be permanently removed. This action cannot be undone."
        itemName={deleteItem?.name}
      />

      <SuccessToast
        message="Deleted successfully"
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
      />

      {/* Drive Image Picker Modal */}
      <Modal isOpen={showDriveModal} onClose={() => setShowDriveModal(false)} title="Choose Photo from Google Drive" size="2xl">
        {loadingDriveImages ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : driveImages.length === 0 ? (
          <div className="text-center py-12">
            <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No images found in Drive</p>
            <p className="text-sm text-gray-400">Upload member photos to your Google Drive folder first</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2">
            {driveImages.map((image) => (
              <div 
                key={image.id} 
                onClick={() => handleDriveImageSelect(image)}
                className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              >
                <img 
                  src={image.thumbnailLink} 
                  alt={image.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Footer />
    </>
  );
}
