"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CalendarDays, Plus, Edit, Trash2, ArrowRight, Clock, MapPin, 
  Calendar, ChevronLeft, ChevronRight, X, Upload, Sparkles, Users, Trophy, Mic, GraduationCap
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { eventsService } from "@/client/services";
import { useAuth } from "@/lib/AuthContext";
import { Event, EventCategory } from "@/types";
import { FadeIn } from "@/components/ui/animations";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { SuccessToast } from "@/components/ui/SuccessToast";

const categoryOptions = [
  { value: "competition", label: "Competition", icon: Trophy, color: "text-yellow-600" },
  { value: "guest_lecture", label: "Guest Lecture", icon: Mic, color: "text-blue-600" },
  { value: "workshop", label: "Workshop", icon: GraduationCap, color: "text-green-600" },
  { value: "other", label: "Other", icon: CalendarDays, color: "text-gray-600" },
];

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  imageUrl: string;
  category: EventCategory;
  // Competition
  registrationDeadline?: string;
  teamMinSize?: string;
  teamMaxSize?: string;
  prizes?: string;
  rulesLink?: string;
  // Guest Lecture
  guestName?: string;
  guestDesignation?: string;
  topic?: string;
  // Workshop
  trainerName?: string;
  prerequisites?: string;
  duration?: string;
  materials?: string;
}

const initialFormData: EventFormData = {
  title: "",
  description: "",
  date: "",
  time: "",
  venue: "",
  imageUrl: "",
  category: "other",
};

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<EventFormData>(initialFormData);
  const [deleteItem, setDeleteItem] = useState<{id: string; name: string} | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventsService.getAll();
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const upcomingEvents = events.filter(event => new Date(event.date) >= new Date());
  const pastEvents = events.filter(event => new Date(event.date) < new Date());
  const displayEvents = activeTab === "upcoming" ? upcomingEvents : pastEvents;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date),
        time: formData.time,
        venue: formData.venue,
        imageUrl: formData.imageUrl,
        category: formData.category,
        registrationDeadline: formData.registrationDeadline ? new Date(formData.registrationDeadline) : undefined,
        teamMinSize: formData.teamMinSize ? parseInt(formData.teamMinSize) : undefined,
        teamMaxSize: formData.teamMaxSize ? parseInt(formData.teamMaxSize) : undefined,
        prizes: formData.prizes,
        rulesLink: formData.rulesLink,
        guestName: formData.guestName,
        guestDesignation: formData.guestDesignation,
        topic: formData.topic,
        trainerName: formData.trainerName,
        prerequisites: formData.prerequisites,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        materials: formData.materials,
      };
      
      if (editingEvent) {
        await eventsService.update(editingEvent.id, eventData);
      } else {
        if (selectedFile) {
          await eventsService.createWithFile(eventData, selectedFile);
        } else {
          await eventsService.create(eventData);
        }
      }
      const updated = await eventsService.getAll();
      setEvents(updated);
      closeModal();
    } catch (error: any) {
      console.error("Failed to save event:", error);
      setFormError(error?.message || "Failed to save event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    try {
      await eventsService.delete(deleteItem.id);
      const updated = await eventsService.getAll();
      setEvents(updated);
      setShowSuccess(true);
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteItem({ id, name });
  };

  const openCreate = () => {
    setEditingEvent(null);
    setFormData(initialFormData);
    setSelectedFile(null);
    setPreviewUrl("");
    setShowModal(true);
  };

  const openEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: new Date(event.date).toISOString().split("T")[0],
      time: event.time,
      venue: event.venue,
      imageUrl: event.imageUrl || "",
      category: event.category || "other",
      registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().split("T")[0] : "",
      teamMinSize: event.teamMinSize?.toString() || "",
      teamMaxSize: event.teamMaxSize?.toString() || "",
      prizes: event.prizes || "",
      rulesLink: event.rulesLink || "",
      guestName: event.guestName || "",
      guestDesignation: event.guestDesignation || "",
      topic: event.topic || "",
      trainerName: event.trainerName || "",
      prerequisites: event.prerequisites || "",
      duration: event.duration?.toString() || "",
      materials: event.materials || "",
    });
    setSelectedFile(null);
    setPreviewUrl(event.imageUrl || "");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setFormData(initialFormData);
    setSelectedFile(null);
    setPreviewUrl("");
  };

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 text-white py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} 
        />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px]"></div>
        
        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full w-fit">
                <CalendarDays className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Technical Events</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">Events</h1>
              <p className="text-white/90 max-w-xl">
                Discover upcoming technical events, workshops, seminars, and competitions organized by JJCET IEEE.
              </p>
            </div>
            {user?.role === "admin" && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openCreate}
                className="inline-flex items-center justify-center gap-2 bg-accent text-foreground px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:shadow-lg hover:-translate-y-0.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add Event
              </motion.button>
            )}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 md:py-20 bg-backgroundbg-slate-900">
        <div className="container-custom">
          {/* Tab Switcher */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-surface rounded-full p-1 shadow-md border border-border">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={cn(
                  "px-5 py-2 rounded-full font-medium text-sm transition-all",
                  activeTab === "upcoming"
                    ? "bg-primary text-white shadow"
                    : "text-muted hover:text-foreground"
                )}
              >
                Upcoming ({upcomingEvents.length})
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={cn(
                  "px-5 py-2 rounded-full font-medium text-sm transition-all",
                  activeTab === "past"
                    ? "bg-primary text-white shadow"
                    : "text-muted hover:text-foreground"
                )}
              >
                Past ({pastEvents.length})
              </button>
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-surface rounded-2xl border border-border overflow-hidden">
                  <div className="aspect-video bg-muted/20 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-muted/20 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-muted/20 rounded w-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayEvents.map((event, index) => (
                <FadeIn key={event.id} delay={index * 0.05}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    className={cn(
                      "group bg-surface rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all",
                      activeTab === "past" && "opacity-75"
                    )}
                  >
                    <Link href={`/events/${event.id}`}>
                      <div className="aspect-video relative overflow-hidden">
                        {event.imageUrl ? (
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <Calendar className="w-10 h-10 text-primary" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 bg-white/95 text-primary font-semibold px-3 py-1.5 rounded-lg shadow text-sm">
                          {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                        {user?.role === "admin" && (
                          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={(e) => { e.preventDefault(); openEdit(event); }}
                              className="p-2 bg-white/95 hover:bg-primary-light text-primary rounded-lg shadow hover:scale-110 transition-all"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.preventDefault(); handleDeleteClick(event.id, event.title); }}
                              className="p-2 bg-white/95 hover:bg-error text-error hover:text-white rounded-lg shadow hover:scale-110 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-sm text-muted mb-3 line-clamp-2">{event.description}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted mb-3">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.time}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.venue}</span>
                        </div>
                        <Link
                          href={`/events/${event.id}`}
                          className={cn(
                            "btn-primary w-full text-center text-sm py-2.5",
                            activeTab === "past" && "btn-secondary"
                          )}
                        >
                          View Details <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </Link>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <CalendarDays className="w-12 h-12 text-muted mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {activeTab === "upcoming" ? "No Upcoming Events" : "No Past Events"}
              </h3>
              <p className="text-muted text-sm">
                {activeTab === "upcoming" ? "Check back soon for new events" : "No events have been held yet"}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingEvent ? "Edit Event" : "Create Event"}
        size="3xl"
      >
        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Event Category</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {categoryOptions.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.value as EventCategory })}
                    className={cn(
                      "p-3 rounded-xl border-all text-2 transition-center",
                      formData.category === cat.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 mx-auto mb-1", cat.color)} />
                    <span className="text-xs font-medium">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="Event Title"
            placeholder="Enter event title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            placeholder="Enter event description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <Input
              type="time"
              label="Time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
          </div>
          <Input
            label="Venue"
            placeholder="Enter venue"
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            required
          />

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Cover Image (Optional)
            </label>
            <div 
              className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <div className="relative">
                  <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setPreviewUrl("");
                    }}
                    className="absolute top-2 right-2 p-1 bg-error text-white rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted mx-auto mb-2" />
                  <p className="text-sm text-muted">Click to upload an image</p>
                  <p className="text-xs text-muted mt-1">PNG, JPG, JPEG up to 5MB</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Competition Specific Fields */}
          {formData.category === "competition" && (
            <div className="space-y-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <h4 className="font-medium text-yellow-800 flex items-center gap-2">
                <Trophy className="w-4 h-4" /> Competition Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="date"
                  label="Registration Deadline"
                  value={formData.registrationDeadline || ""}
                  onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    label="Min Team Size"
                    placeholder="2"
                    value={formData.teamMinSize || ""}
                    onChange={(e) => setFormData({ ...formData, teamMinSize: e.target.value })}
                  />
                  <Input
                    type="number"
                    label="Max Team Size"
                    placeholder="5"
                    value={formData.teamMaxSize || ""}
                    onChange={(e) => setFormData({ ...formData, teamMaxSize: e.target.value })}
                  />
                </div>
              </div>
              <Textarea
                label="Prizes"
                placeholder="Enter prize details (e.g., 1st Prize: ₹5000, 2nd Prize: ₹3000)"
                value={formData.prizes || ""}
                onChange={(e) => setFormData({ ...formData, prizes: e.target.value })}
                rows={2}
              />
              <Input
                label="Rules Link"
                placeholder="https://example.com/rules"
                value={formData.rulesLink || ""}
                onChange={(e) => setFormData({ ...formData, rulesLink: e.target.value })}
              />
            </div>
          )}

          {/* Guest Lecture Specific Fields */}
          {formData.category === "guest_lecture" && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-medium text-blue-800 flex items-center gap-2">
                <Mic className="w-4 h-4" /> Guest Lecture Details
              </h4>
              <Input
                label="Chief Guest Name"
                placeholder="Enter guest name"
                value={formData.guestName || ""}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
              />
              <Input
                label="Guest Designation/Company"
                placeholder="e.g., Senior Engineer, Google"
                value={formData.guestDesignation || ""}
                onChange={(e) => setFormData({ ...formData, guestDesignation: e.target.value })}
              />
              <Input
                label="Topic"
                placeholder="Enter topic/subject"
                value={formData.topic || ""}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              />
            </div>
          )}

          {/* Workshop Specific Fields */}
          {formData.category === "workshop" && (
            <div className="space-y-4 p-4 bg-green-50 rounded-xl border border-green-200">
              <h4 className="font-medium text-green-800 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> Workshop Details
              </h4>
              <Input
                label="Trainer Name"
                placeholder="Enter trainer name"
                value={formData.trainerName || ""}
                onChange={(e) => setFormData({ ...formData, trainerName: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Duration (hours)"
                  placeholder="2"
                  value={formData.duration || ""}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
              <Textarea
                label="Prerequisites"
                placeholder="What should participants know before attending?"
                value={formData.prerequisites || ""}
                onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                rows={2}
              />
              <Textarea
                label="Materials Needed"
                placeholder="List any materials participants need to bring"
                value={formData.materials || ""}
                onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                rows={2}
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={closeModal} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingEvent ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={confirmDelete}
        title="Delete Event?"
        message="This event will be permanently deleted. This action cannot be undone."
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
