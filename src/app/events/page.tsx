"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  CalendarDays, Plus, Edit, Trash2, ArrowRight, Clock, MapPin, 
  X, Users, Trophy, Mic, GraduationCap, Folder, MoreVertical
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { eventsService } from "@/client/services";
import { useAuth } from "@/lib/AuthContext";
import { Event, EventCategory, EventField } from "@/types";
import { getCollections, DriveFolder } from "@/lib/drive";
import { FadeIn } from "@/components/ui/animations";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { SuccessToast } from "@/components/ui/SuccessToast";
import { eventFields, getFieldsByCategory, getDefaultFieldsForCategory, getFieldConfig, categoryOptions, FieldConfig } from "@/lib/eventConfig";

interface FormField extends EventField {
  enabled: boolean;
  placeholder?: string;
  rows?: number;
}

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  showTime: boolean;
  venue: string;
  imageUrl: string;
  category: EventCategory;
  fields: FormField[];
  showRegister: boolean;
  registerLink: string;
  showDeadline: boolean;
  registrationDeadline: string;
  galleryFolderId: string;
  galleryFolderName: string;
}

const getInitialFields = (category: EventCategory): FormField[] => {
  const categoryFields = getFieldsByCategory(category);
  const defaultKeys = getDefaultFieldsForCategory(category);
  
  return categoryFields.map(f => ({
    key: f.key,
    label: f.label,
    type: f.type,
    value: "",
    enabled: defaultKeys.includes(f.key),
    placeholder: f.placeholder,
    rows: f.rows
  }));
};

const initialFormData: EventFormData = {
  title: "",
  description: "",
  date: "",
  time: "",
  showTime: true,
  venue: "",
  imageUrl: "",
  category: "other",
  fields: getInitialFields("other"),
  showRegister: true,
  registerLink: "",
  showDeadline: false,
  registrationDeadline: "",
  galleryFolderId: "",
  galleryFolderName: "",
};

function EventsContent() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [formData, setFormData] = useState<EventFormData>(initialFormData);
  const [deleteItem, setDeleteItem] = useState<{id: string; name: string} | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [driveImages, setDriveImages] = useState<any[]>([]);
  const [loadingDriveImages, setLoadingDriveImages] = useState(false);
  const [galleryFolders, setGalleryFolders] = useState<DriveFolder[]>([]);

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

    const fetchGalleryFolders = async () => {
      try {
        const folders = await getCollections();
        setGalleryFolders(folders);
      } catch (error) {
        console.error("Failed to fetch gallery folders:", error);
      }
    };

    fetchEvents();
    fetchGalleryFolders();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  const isEventUpcoming = (eventDate: Date | string, eventTime: string) => {
    const date = new Date(eventDate);
    const today = new Date();
    
    if (eventTime) {
      const [hours, minutes] = eventTime.split(':').map(Number);
      date.setHours(hours || 0, minutes || 0, 0, 0);
    } else {
      date.setHours(23, 59, 59, 999);
    }
    
    return date > today;
  };

  const categoryFields = getFieldsByCategory(formData.category);

  const handleCategoryChange = (category: EventCategory) => {
    const newFields = getInitialFields(category);
    setFormData({ ...formData, category, fields: newFields });
  };

  const toggleField = (key: string) => {
    const newFields = formData.fields.map(f => 
      f.key === key ? { ...f, enabled: !f.enabled, value: !f.enabled ? f.value : "" } : f
    );
    setFormData({ ...formData, fields: newFields });
  };

  const updateFieldValue = (key: string, value: string) => {
    const newFields = formData.fields.map(f => 
      f.key === key ? { ...f, value } : f
    );
    setFormData({ ...formData, fields: newFields });
  };

  const renderFieldInput = (field: FormField) => {
    if (!field.enabled) return null;
    
    const config = getFieldConfig(field.key);
    
    if (field.type === "textarea") {
      return (
        <Textarea
          key={field.key}
          label={field.label}
          placeholder={field.placeholder}
          value={field.value}
          onChange={(e) => updateFieldValue(field.key, e.target.value)}
          rows={field.rows || 3}
        />
      );
    }
    
    return (
      <Input
        key={field.key}
        type={field.type}
        label={field.label}
        placeholder={field.placeholder}
        value={field.value}
        onChange={(e) => updateFieldValue(field.key, e.target.value)}
      />
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    
    try {
      const enabledFields = formData.fields
        .filter(f => f.enabled && f.value.trim())
        .map(f => ({
          key: f.key,
          label: f.label,
          type: f.type,
          value: f.value
        }));
      
      const eventData: any = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        venue: formData.venue,
        imageUrl: formData.imageUrl,
        category: formData.category,
        fields: enabledFields,
        showRegister: formData.showRegister,
        registerLink: formData.registerLink,
        showDeadline: formData.showDeadline,
        registrationDeadline: formData.registrationDeadline || null,
        galleryFolderId: formData.galleryFolderId || null,
        galleryFolderName: formData.galleryFolderName || null,
      };
      
      if (editingEvent) {
        await eventsService.update(editingEvent.id, eventData);
      } else {
        await eventsService.create(eventData);
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

  const openCreate = () => {
    setEditingEvent(null);
    setPreviewUrl("");
    setFormData(initialFormData);
    setShowModal(true);
  };

  const openEdit = (event: Event) => {
    setEditingEvent(event);
    
    const categoryFields = getFieldsByCategory(event.category);
    const formFields: FormField[] = categoryFields.map(f => {
      const existingField = event.fields?.find(ef => ef.key === f.key);
      return {
        key: f.key,
        label: f.label,
        type: f.type,
        value: existingField?.value || "",
        enabled: !!existingField,
        placeholder: f.placeholder,
        rows: f.rows
      };
    });

    setFormData({
      title: event.title,
      description: event.description,
      date: new Date(event.date).toISOString().split("T")[0],
      time: event.time,
      showTime: !!event.time,
      venue: event.venue,
      imageUrl: event.imageUrl || "",
      category: event.category || "other",
      fields: formFields,
      showRegister: event.showRegister ?? true,
      registerLink: event.registerLink || "",
      showDeadline: event.showDeadline ?? false,
      registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().split("T")[0] : "",
      galleryFolderId: event.galleryFolderId || "",
      galleryFolderName: event.galleryFolderName || "",
    });
    setPreviewUrl(event.imageUrl || "");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setFormData(initialFormData);
  };

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

  const handleDriveImageSelect = (image: any) => {
    const imageUrl = image.thumbnailLink || image.webViewLink || image.url;
    setPreviewUrl(image.thumbnailLink || imageUrl);
    setFormData({ ...formData, imageUrl });
    setShowDriveModal(false);
  };

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 text-white py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full w-fit mb-2">
                <CalendarDays className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Technical Events</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Events</h1>
              <p className="text-white/90 max-w-xl">
                Discover upcoming technical events, workshops, seminars, and competitions organized by JJCET IEEE.
              </p>
            </div>
            {user?.role === "admin" && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openCreate} className="inline-flex items-center justify-center gap-2 bg-accent text-foreground px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:shadow-lg hover:-translate-y-0.5 shrink-0">
                <Plus className="w-4 h-4" /> Add Event
              </motion.button>
            )}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container-custom">
          {/* Events Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-surface rounded-2xl border border-border overflow-hidden">
                  <div className="aspect-video bg-muted/20 animate-pulse" />
                  <div className="p-5 space-y-3"><div className="h-5 bg-muted/20 rounded w-3/4 animate-pulse" /><div className="h-4 bg-muted/20 rounded w-full animate-pulse" /></div>
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, index) => {
                const isUpcoming = isEventUpcoming(event.date, event.time);
                return (
                  <FadeIn key={event.id} delay={index * 0.05}>
                    <motion.div whileHover={{ y: -5 }} className={cn("bg-surface rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all", !isUpcoming && "opacity-80")}>
                      <Link href={`/events/${event.id}`}>
                        <div className="aspect-video relative overflow-hidden group">
                          {event.imageUrl ? (
                            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-contain bg-muted/20" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                              <CalendarDays className="w-10 h-10 text-primary" />
                            </div>
                          )}
                          <div className="absolute top-3 left-3 flex gap-2">
                            <span className={cn("px-3 py-1.5 rounded-lg shadow text-sm font-semibold", isUpcoming ? "bg-green-500 text-white" : "bg-slate-600 text-white")}>
                              {isUpcoming ? "Upcoming" : "Past"}
                            </span>
                            <span className="bg-white/95 text-primary font-semibold px-3 py-1.5 rounded-lg shadow text-sm">
                              {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                          {user?.role === "admin" && (
                            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all">
                              <div className="relative">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === event.id ? null : event.id); }}
                                  className="p-2 bg-white/95 hover:bg-slate-100 text-slate-600 rounded-lg shadow-lg transition-all"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                                {openMenuId === event.id && (
                                  <div className="absolute right-0 bottom-full mb-1 bg-white rounded-lg shadow-xl border border-slate-200 py-1 min-w-[120px] z-30">
                                    <button onClick={() => { openEdit(event); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                      <Edit className="w-4 h-4" />
                                      Edit
                                    </button>
                                    <button onClick={() => { setDeleteItem({ id: event.id, name: event.title }); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                      <Trash2 className="w-4 h-4" />
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="font-semibold text-foreground mb-2 line-clamp-1">{event.title}</h3>
                          <p className="text-sm text-muted mb-3 line-clamp-2">{event.description}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-muted mb-3">
                            {event.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.time}</span>}
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.venue}</span>
                          </div>
                          <div className={cn("btn-primary w-full text-center text-sm py-2.5", !isUpcoming && "btn-secondary")}>
                            View Details <ArrowRight className="w-4 h-4 inline ml-1" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  </FadeIn>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <CalendarDays className="w-12 h-12 text-muted mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-1">No Events</h3>
              <p className="text-muted text-sm">Events will appear here once added.</p>
            </div>
          )}
        </div>
      </section>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editingEvent ? "Edit Event" : "Create Event"} size="3xl">
        {formError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{formError}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Event Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2">Event Information</h3>
            <Input label="Event Title" placeholder="Enter event title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            <Textarea label="Description" placeholder="Enter event description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} required />
            <div className="grid grid-cols-2 gap-4">
              <Input type="date" label="Date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">Time</label>
                  <button type="button" onClick={() => setFormData({ ...formData, showTime: !formData.showTime, time: !formData.showTime ? formData.time : "" })} className={cn("w-10 h-5 rounded-full transition-colors relative shrink-0", formData.showTime ? "bg-primary" : "bg-gray-300")}>
                    <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform", formData.showTime ? "left-5" : "left-0.5")} />
                  </button>
                </div>
                {formData.showTime && (
                  <Input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} required />
                )}
              </div>
            </div>
            <Input label="Venue" placeholder="Enter venue" value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} required />
            
            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Cover Image</label>
              <button type="button" onClick={openDrivePicker} className="w-full py-3 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <span className="text-blue-500 text-sm">Choose from Google Drive</span>
              </button>
              {previewUrl && (
                <div className="mt-2 relative inline-block">
                  <img src={previewUrl} alt="Preview" className="max-h-32 rounded-lg" />
                  <button type="button" onClick={() => { setPreviewUrl(""); setFormData({ ...formData, imageUrl: "" }); }} className="absolute -top-2 -right-2 p-1 bg-error text-white rounded-full"><X className="w-3 h-3" /></button>
                </div>
              )}
            </div>
          </div>

          {/* Section: Link Gallery Album */}
          {galleryFolders.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground border-b pb-2 mb-4 flex items-center gap-2">
                <Folder className="w-5 h-5" /> Link Gallery Album
              </h3>
              <p className="text-sm text-muted mb-4">Select a gallery album to display on the event page.</p>
              <select
                value={formData.galleryFolderId}
                onChange={(e) => {
                  const selectedFolder = galleryFolders.find(f => f.id === e.target.value);
                  setFormData({ 
                    ...formData, 
                    galleryFolderId: e.target.value,
                    galleryFolderName: selectedFolder?.name || ""
                  });
                }}
                className="w-full p-3 rounded-xl border border-border bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value="">No album linked</option>
                {galleryFolders.map((folder) => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>
              {formData.galleryFolderId && (
                <p className="text-sm text-green-600 mt-2">✓ Linked: {formData.galleryFolderName}</p>
              )}
            </div>
          )}

          {/* Section 2: Event Category */}
          <div>
            <h3 className="text-lg font-semibold text-foreground border-b pb-2 mb-4">Event Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {categoryOptions.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button key={cat.value} type="button" onClick={() => handleCategoryChange(cat.value as EventCategory)} className={cn("p-3 rounded-xl border-2 transition-all", formData.category === cat.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                    <Icon className={cn("w-5 h-5 mx-auto mb-1", cat.color)} />
                    <span className="text-xs font-medium">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Customizable Event Fields */}
          <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" /> Customizable Event Fields
            </h3>
            <p className="text-sm text-gray-600 mb-4">Toggle fields to include in this event. Enabled fields will appear on the event page.</p>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              {categoryFields.map(field => {
                const isEnabled = formData.fields.find(f => f.key === field.key)?.enabled;
                return (
                  <div key={field.key} className={cn("flex items-center justify-between p-3 rounded-lg border transition-all", isEnabled ? "bg-white border-primary/30" : "bg-gray-50 border-gray-200")}>
                    <span className="text-sm font-medium text-foreground">{field.label}</span>
                    <button type="button" onClick={() => toggleField(field.key)} className={cn("w-10 h-5 rounded-full transition-colors relative shrink-0", isEnabled ? "bg-primary" : "bg-gray-300")}>
                      <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform", isEnabled ? "left-5" : "left-0.5")} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Dynamic Input Fields */}
            <div className="grid grid-cols-2 gap-4">
              {formData.fields.filter(f => f.enabled).map(renderFieldInput)}
            </div>
          </div>

          {/* Section 4: Registration Settings */}
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" /> Registration Settings
            </h3>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium text-foreground">Enable Registration</p>
                <p className="text-sm text-muted">Show register button on event page</p>
              </div>
              <button type="button" onClick={() => setFormData({ ...formData, showRegister: !formData.showRegister })} className={cn("w-12 h-6 rounded-full transition-colors relative", formData.showRegister ? "bg-primary" : "bg-gray-300")}>
                <span className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-transform", formData.showRegister ? "left-7" : "left-1")} />
              </button>
            </div>

            {formData.showRegister && (
              <>
                <Input 
                  label="Registration Link (Optional)" 
                  placeholder="https://forms.example.com/register" 
                  value={formData.registerLink} 
                  onChange={(e) => setFormData({ ...formData, registerLink: e.target.value })} 
                  className="mb-4" 
                />
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium text-foreground">Enable Registration Deadline</p>
                    <p className="text-sm text-muted">Set a last date to register</p>
                  </div>
                  <button type="button" onClick={() => setFormData({ ...formData, showDeadline: !formData.showDeadline, registrationDeadline: !formData.showDeadline ? formData.registrationDeadline : "" })} className={cn("w-12 h-6 rounded-full transition-colors relative", formData.showDeadline ? "bg-primary" : "bg-gray-300")}>
                    <span className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-transform", formData.showDeadline ? "left-7" : "left-1")} />
                  </button>
                </div>

                {formData.showDeadline && (
                  <Input 
                    type="date" 
                    label="Registration Deadline" 
                    value={formData.registrationDeadline} 
                    max={formData.date}
                    onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })} 
                  />
                )}
              </>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={closeModal} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingEvent ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={confirmDelete} title="Delete Event?" message="This event will be permanently deleted." itemName={deleteItem?.name} />
      
      {/* Drive Picker */}
      <Modal isOpen={showDriveModal} onClose={() => setShowDriveModal(false)} title="Choose Image" size="4xl">
        {loadingDriveImages ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div></div>
        ) : driveImages.length === 0 ? (
          <div className="text-center py-12"><p className="text-gray-500">No images found</p></div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-2">
            {driveImages.map((image) => (
              <div key={image.id} onClick={() => handleDriveImageSelect(image)} className="aspect-square relative rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary">
                <img src={image.thumbnailLink || image.url} alt={image.name} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </Modal>
      
      <SuccessToast message="Event saved successfully!" isVisible={showSuccess} onClose={() => setShowSuccess(false)} />
      <Footer />
    </>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    }>
      <EventsContent />
    </Suspense>
  );
}
