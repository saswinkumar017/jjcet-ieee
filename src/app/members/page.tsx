"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Edit, Trash2, Mail, Linkedin, Instagram } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { membersService } from "@/client/services";
import { useAuth } from "@/lib/AuthContext";
import { TeamMember } from "@/types";
import { FadeIn } from "@/components/ui/animations";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { SuccessToast } from "@/components/ui/SuccessToast";

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
  });
  const [deleteItem, setDeleteItem] = useState<{id: string; name: string} | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

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
    setFormData({ name: "", role: "", email: "", photoUrl: "", linkedin: "", order: members.length + 1 });
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
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4,5,6,7,8].map((i) => (
                <div key={i} className="bg-surface rounded-2xl border border-border p-6 text-center">
                  <div className="w-32 h-32 mx-auto bg-muted/20 rounded-full animate-pulse mb-4" />
                  <div className="h-5 bg-muted/20 rounded w-2/3 mx-auto mb-2" />
                  <div className="h-4 bg-muted/20 rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : members.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {members.map((member, index) => (
                <FadeIn key={member.id} delay={index * 0.05}>
                  <motion.div whileHover={{ y: -10 }}
                    className="group bg-surface rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all"
                  >
                    <div className="relative">
                      <div className="aspect-square overflow-hidden">
                        {member.photoUrl ? (
                          <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <Users className="w-20 h-20 text-primary/30" />
                          </div>
                        )}
                      </div>
                      {user?.role === "admin" && (
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => openEdit(member)} className="p-2 bg-white shadow-lg rounded-lg hover:bg-primary-light">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteClick(member.id, member.name)} className="p-2 bg-error text-white shadow-lg rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="p-5 text-center">
                      <h3 className="font-bold text-lg text-foreground">{member.name}</h3>
                      <p className="text-primary font-medium text-sm mb-3">{member.role}</p>
                      <div className="flex justify-center gap-2">
                        {member.email && <a href={`mailto:${member.email}`} className="p-2 bg-muted/20 rounded-lg hover:bg-primary-light transition-all"><Mail className="w-4 h-4" /></a>}
                        {member.linkedin && <a href={member.linkedin} target="_blank" className="p-2 bg-muted/20 rounded-lg hover:bg-blue-100 transition-all"><Linkedin className="w-4 h-4" /></a>}
                      </div>
                    </div>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
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
            <Input label="Photo URL" placeholder="Enter photo URL" value={formData.photoUrl} onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="LinkedIn URL" placeholder="Enter LinkedIn profile" value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} />
            <Input label="Display Order" type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })} />
          </div>
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

      <Footer />
    </>
  );
}
