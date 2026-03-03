"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CalendarDays, Plus, Edit, Trash2, ArrowRight, Clock, MapPin, 
  Calendar, ChevronLeft, ChevronRight, X, Sparkles, Users, Trophy, Mic, GraduationCap
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
  console.log('Current user:', user);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [formData, setFormData] = useState<EventFormData>(initialFormData);
  const [deleteItem, setDeleteItem] = useState<{id: string; name: string} | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Drive image selection
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [driveImages, setDriveImages] = useState<any[]>([]);
  const [loadingDriveImages, setLoadingDriveImages] = useState(false);
  const [selectedDriveImage, setSelectedDriveImage] = useState<string | null>(null);
  
  // Fetch images from Drive
  const openDrivePicker = async () => {
    setShowDriveModal(true);
    setLoadingDriveImages(true);
    try {
      const { getEventImages } = await import('@/lib/drive');
      const images = await getEventImages();
      setDriveImages(images);
    } catch (error) {
      console.error('Failed to load Drive images:', error);
    } finally {
      setLoadingDriveImages(false);
    }
  };
  
  // Select image from Drive
  const handleDriveImageSelect = (image: any) => {
    // Store the thumbnailLink (direct image URL) for display in Firestore
    // The thumbnailLink is /api/drive?action=image&fileId=XXX which works as img src
    const imageUrl = image.thumbnailLink || image.webViewLink || image.url;
    setSelectedDriveImage(imageUrl);
    setPreviewUrl(image.thumbnailLink || imageUrl);
    setFormData({ ...formData, imageUrl });
    setShowDriveModal(false);
  };
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
        await eventsService.create(eventData);
      }
      console.log('Event created, fetching updated list');
      const updated = await eventsService.getAll();
      console.log('Events fetched:', updated.length);
      setEvents(updated);
      closeModal();
    } catch (error: any) {
      console.error("Failed to save event:", error);
      alert("Error: " + (error?.message || error?.toString() || "Unknown error"));
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
    setPreviewUrl("");
    setShowModal(true);
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
    });
    setPreviewUrl(event.imageUrl || "");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setFormData(initialFormData);
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

          {/* Image Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Cover Image (Optional)
            </label>
            <div className="mb-2">
              <button
                type="button"
                onClick={openDrivePicker}
                className="w-full py-2 px-4 border-2 border-dashed border-blue-300 rounded-xl text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <svg className="w-5 h-5 mx-auto mb-1 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
                </svg>
                <p className="text-xs text-blue-500">Choose from Google Drive</p>
              </button>
            </div>
            <div className="mb-2">
              <Input 
                label="Or enter Image URL" 
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={(e) => {
                  setFormData({ ...formData, imageUrl: e.target.value });
                  setPreviewUrl(e.target.value);
                }}
              />
            </div>
            <div 
              className="border-2 border-dashed border-border rounded-xl p-4 text-center"
            >
              {previewUrl ? (
                <div className="relative">
                  <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewUrl("");
                      setFormData({ ...formData, imageUrl: "" });
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="text-sm text-muted">No image selected</p>
              )}
            </div>
          </div>

          {/* Competition Specific Fields */}
          {formData.category === "competition" && (
            <div className="space-y-4">
              {/* Individual / Team Toggle */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Participation Type</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ 
                        ...formData, 
                        teamMinSize: "", 
                        teamMaxSize: "" 
                      });
                    }}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 font-medium",
                      (!formData.teamMinSize && !formData.teamMaxSize)
                        ? "border-primary bg-primary/10 text-primary shadow-md"
                        : "border-border hover:border-primary/50 text-muted-foreground"
                    )}
                  >
                    <Users className={cn("w-5 h-5 mx-auto mb-1", (!formData.teamMinSize && !formData.teamMaxSize) ? "text-primary" : "text-muted")} />
                    <span className="text-sm">Individual</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ 
                        ...formData, 
                        teamMinSize: "2", 
                        teamMaxSize: "4" 
                      });
                    }}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 font-medium",
                      (formData.teamMinSize || formData.teamMaxSize)
                        ? "border-primary bg-primary/10 text-primary shadow-md"
                        : "border-border hover:border-primary/50 text-muted-foreground"
                    )}
                  >
                    <Users className={cn("w-5 h-5 mx-auto mb-1", (formData.teamMinSize || formData.teamMaxSize) ? "text-primary" : "text-muted")} />
                    <span className="text-sm">Team</span>
                  </button>
                </div>
              </div>
              
              {/* Other Details */}
              <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Other Details
                </h4>
                <Textarea
                  label="Additional Information"
                  placeholder="Any other details about the competition (format, rounds, judging criteria, etc.)"
                  value={formData.materials || ""}
                  onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                  rows={3}
                />
              </div>
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
      
      {/* Drive Image Picker Modal */}
      <Modal
        isOpen={showDriveModal}
        onClose={() => setShowDriveModal(false)}
        title="Choose Image from Google Drive"
        size="4xl"
      >
        {loadingDriveImages ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : driveImages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No images found in Drive</p>
            <p className="text-sm text-gray-400">Upload images to your Google Drive folder first</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-2">
            {driveImages.map((image) => (
              <div
                key={image.id}
                onClick={() => handleDriveImageSelect(image)}
                className="aspect-square relative rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              >
                <img
                  src={image.thumbnailLink || image.url}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center">
                  <span className="text-white opacity-0 hover:opacity-100 text-xs font-medium px-2 text-center">{image.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
      
      <SuccessToast
        message="Event saved successfully!"
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
      <Footer />
    </>
  );
}
