"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { eventsService } from "@/client/services";
import { useAuth } from "@/lib/AuthContext";
import { Event } from "@/types";
import { motion } from "framer-motion";
import { getGalleryImages, getDriveThumbnailUrl } from "@/lib/drive";
import { 
  Calendar, Clock, MapPin, Users, ArrowLeft, ArrowRight, Share2, Check, 
  Trophy, Mic, GraduationCap, AlertCircle, Images, X
} from "lucide-react";
import { getCategoryInfo, getFieldIcon } from "@/lib/eventConfig";

const formatDate = (date: Date | string | number): string => {
  const d = new Date(date);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
};

const formatShortDate = (date: Date | string | number): string => {
  const d = new Date(date);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await eventsService.getById(params.id as string);
        setEvent(data);
        if (data && user) {
          setRegistered(data.registeredUsers?.includes(user.uid));
        }
        if (data?.galleryFolderId && data.galleryFolderId.trim() !== "") {
          setGalleryLoading(true);
          try {
            const response = await fetch(`/api/drive?action=images&folderId=${encodeURIComponent(data.galleryFolderId)}`);
            if (response.ok) {
              const imgs = await response.json();
              setGalleryImages(imgs.slice(0, 12));
            }
          } catch (err) {
            console.error("Failed to fetch gallery images:", err);
          }
          setGalleryLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch event", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [params.id, user]);

  const handleRegister = () => {
    if (!event?.registerLink) return;
    if (!user) {
      router.push("/login");
      return;
    }
    window.open(event.registerLink, "_blank");
  };

  const handleInternalRegister = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      await eventsService.registerUser(params.id as string, user.uid);
      setRegistered(true);
    } catch (error) {
      console.error("Failed to register", error);
    }
  };

  const handleUnregister = async () => {
    if (!user) return;
    try {
      await eventsService.unregisterUser(params.id as string, user.uid);
      setRegistered(false);
    } catch (error) {
      console.error("Failed to unregister", error);
    }
  };

  const isRegistrationOpen = (): boolean => {
    if (!event) return false;
    if (!event.showRegister) return false;
    if (!isUpcoming) return false;
    if (event.showDeadline && event.registrationDeadline) {
      const deadlineDate = new Date(event.registrationDeadline);
      if (deadlineDate < new Date()) return false;
    }
    return true;
  };

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

  const isUpcoming = event ? isEventUpcoming(event.date, event.time) : false;
  const registrationOpen = isRegistrationOpen();
  const categoryInfo = event ? getCategoryInfo(event.category) : null;

  const renderField = (field: { key: string; label: string; type: string; value: string }) => {
    const Icon = getFieldIcon(field.key);
    
    if (field.key === "rules" && field.value) {
      return (
        <a 
          key={field.key} 
          href={field.value} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-3 p-4 bg-primary-light/30 rounded-lg hover:bg-primary-light/50 transition-colors"
        >
          <Icon className="w-5 h-5 text-primary shrink-0" />
          <span className="font-medium text-primary">View Rules & Regulations</span>
        </a>
      );
    }

    if (field.key === "teamSize" && field.value) {
      return (
        <div key={field.key} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted">{field.label}</p>
            <p className="font-medium text-foreground">{field.value}</p>
          </div>
        </div>
      );
    }

    if (field.key === "duration" && field.value) {
      const numValue = Number(field.value);
      return (
        <div key={field.key} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted">{field.label}</p>
            <p className="font-medium text-foreground">{numValue} hour{numValue > 1 ? 's' : ''}</p>
          </div>
        </div>
      );
    }

    return (
      <div key={field.key} className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted">{field.label}</p>
          <p className="font-medium text-foreground whitespace-pre-wrap">{field.value}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Event Not Found</h1>
            <Link href="/events" className="btn-primary">Back to Events</Link>
          </div>
        </div>
      
      </>
    );
  }

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-violet-700 to-fuchsia-800 text-white py-16">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
        
        <div className="container-custom relative">
          <Link href="/events" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                {isUpcoming && <span className="px-4 py-1 bg-accent text-foreground font-medium rounded-full">Upcoming Event</span>}
                {categoryInfo && (
                  <span className={categoryInfo.bg + " inline-flex items-center gap-2 px-3 py-1 rounded-full"}>
                    <categoryInfo.icon className={categoryInfo.color + " w-4 h-4"} />
                    <span className={categoryInfo.color + " text-sm font-medium"}>{categoryInfo.label}</span>
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">{event.title}</h1>
              <div className="flex flex-wrap gap-6 text-white/90">
                <span className="flex items-center gap-2"><Calendar className="w-5 h-5" />{formatDate(event.date)}</span>
                <span className="flex items-center gap-2"><Clock className="w-5 h-5" />{event.time}</span>
                <span className="flex items-center gap-2"><MapPin className="w-5 h-5" />{event.venue}</span>
              </div>
            </div>

            {event.imageUrl && (
              <div className="relative">
                <img src={event.imageUrl} alt={event.title} className="w-full max-h-48 md:max-h-64 lg:max-h-80 xl:max-h-96 object-contain rounded-2xl shadow-2xl bg-muted/20" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">About This Event</h2>
                <p className="text-muted whitespace-pre-wrap leading-relaxed">{event.description}</p>
              </div>

              {/* Event Details - Dynamic Fields */}
              {event.fields && event.fields.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                    {event.category === "competition" && <Trophy className="w-6 h-6 text-yellow-600" />}
                    {event.category === "guest_lecture" && <Mic className="w-6 h-6 text-blue-600" />}
                    {event.category === "workshop" && <GraduationCap className="w-6 h-6 text-green-600" />}
                    Event Details
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {event.fields.map(renderField)}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Event Details Card */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Event Details</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center"><Calendar className="w-5 h-5 text-primary" /></div>
                    <div><p className="text-sm text-muted">Date</p><p className="font-medium text-foreground">{formatShortDate(event.date)}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center"><Clock className="w-5 h-5 text-primary" /></div>
                    <div><p className="text-sm text-muted">Time</p><p className="font-medium text-foreground">{event.time}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center"><MapPin className="w-5 h-5 text-primary" /></div>
                    <div><p className="text-sm text-muted">Venue</p><p className="font-medium text-foreground">{event.venue}</p></div>
                  </div>
                 
                  {/*<div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-primary" /></div>
                    <div><p className="text-sm text-muted">Registered</p><p className="font-medium text-foreground">{event.registeredUsers?.length || 0} participants</p></div>
                  </div>*/}
                </div>

                {/* Deadline Warning */}
                {event.showDeadline && event.registrationDeadline && (
                  <div className={cn("p-4 rounded-xl mb-4 flex items-center gap-3", !registrationOpen ? "bg-red-50 border border-red-200" : "bg-orange-50 border border-orange-200")}>
                    <Clock className={cn("w-5 h-5 shrink-0", !registrationOpen ? "text-red-600" : "text-orange-600")} />
                    <div>
                      <p className="text-sm font-medium">{!registrationOpen ? "Registration Closed" : "Register Before"}</p>
                      <p className={cn("font-semibold", !registrationOpen ? "text-red-600" : "text-orange-700")}>
                        {formatShortDate(event.registrationDeadline)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Registration Button */}
                {registrationOpen ? (
                  event.registerLink ? (
                    <button onClick={handleRegister} className="w-full btn-primary flex items-center justify-center gap-2">
                      Register Now <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : registered ? (
                    <button onClick={handleUnregister} className="w-full btn-secondary flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" /> Registered - Click to Unregister
                    </button>
                  ) : (
                    <button onClick={handleInternalRegister} className="w-full btn-primary flex items-center justify-center gap-2">
                      Register Now <ArrowRight className="w-5 h-5" />
                    </button>
                  )
                ) : (
                  <div className="flex items-center justify-center gap-2 p-4 bg-gray-100 rounded-lg text-muted">
                    <AlertCircle className="w-5 h-5" />
                    <span>{!isUpcoming ? "Event has ended" : "Registration Closed"}</span>
                  </div>
                )}
              </div>

              {/* Share Card */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Share This Event</h3>
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Link copied!"); }} className="w-full flex items-center justify-center gap-2 border border-border rounded-lg py-3 hover:bg-background transition-colors">
                  <Share2 className="w-5 h-5" /> Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section - Above Footer */}
      {event.galleryFolderId && event.galleryFolderId.trim() !== "" && (
        <section className="py-12 bg-background">
          <div className="container-custom">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Images className="w-5 h-5 text-violet-500" /> {event.galleryFolderName || "Event Gallery"}
                </h3>
                <Link 
                  href={`/gallery?folder=${event.galleryFolderId}`}
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium"
                >
                  View Album →
                </Link>
              </div>
              {galleryLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-violet-500 border-t-transparent"></div>
                </div>
              ) : galleryImages.length > 0 ? (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {galleryImages.slice(0, 6).map((img: any) => (
                      <div key={img.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img 
                          src={img.thumbnailLink || `/api/drive?action=image&fileId=${img.id}`}
                          alt={img.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  {galleryImages.length > 6 && (
                    <div className="mt-4 text-center">
                      <Link 
                        href={`/gallery?folder=${event.galleryFolderId}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium"
                      >
                        View All {galleryImages.length} Photos →
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted text-center py-4">No images available</p>
              )}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
