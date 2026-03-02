"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { eventsService } from "@/client/services";
import { useAuth } from "@/lib/AuthContext";
import { Event } from "@/types";
import { Calendar, Clock, MapPin, Users, ArrowLeft, ArrowRight, Share2, Check } from "lucide-react";

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
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await eventsService.getById(params.id as string);
        setEvent(data);
        if (data && user) {
          setRegistered(data.registeredUsers?.includes(user.uid));
        }
      } catch (error) {
        console.error("Failed to fetch event", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.id, user]);

  const handleRegister = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setRegistering(true);
    try {
      await eventsService.registerUser(params.id as string, user.uid);
      setRegistered(true);
    } catch (error) {
      console.error("Failed to register", error);
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!user) return;

    setRegistering(true);
    try {
      await eventsService.unregisterUser(params.id as string, user.uid);
      setRegistered(false);
    } catch (error) {
      console.error("Failed to unregister", error);
    } finally {
      setRegistering(false);
    }
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
            <Link href="/events" className="btn-primary">
              Back to Events
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
  const isUpcoming = !isNaN(eventDate.getTime()) && eventDate > new Date();

  return (
    <>
      <Header />
      
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-[#003a5e]from-slate-900via-slate-800to-[#0f172a] text-white py-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="container-custom relative">
          <Link href="/events" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {isUpcoming && (
                <span className="inline-block px-4 py-1 bg-accent text-foreground font-medium rounded-full mb-4">
                  Upcoming Event
                </span>
              )}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                {event.title}
              </h1>
              <div className="flex flex-wrap gap-6 text-white/90">
                <span className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {formatDate(eventDate)}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {event.time}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {event.venue}
                </span>
              </div>
            </div>

            {event.imageUrl && (
              <div className="relative">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full rounded-2xl shadow-2xl"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">About This Event</h2>
                <p className="text-muted whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Event Details</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted">Date</p>
                      <p className="font-medium text-foreground">
                        {formatShortDate(eventDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted">Time</p>
                      <p className="font-medium text-foreground">{event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted">Venue</p>
                      <p className="font-medium text-foreground">{event.venue}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted">Registered</p>
                      <p className="font-medium text-foreground">{event.registeredUsers?.length || 0} participants</p>
                    </div>
                  </div>
                </div>

                {isUpcoming && (
                  <>
                    {registered ? (
                      <button
                        onClick={handleUnregister}
                        disabled={registering}
                        className="w-full btn-secondary flex items-center justify-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        {registering ? "Processing..." : "Registered - Click to Unregister"}
                      </button>
                    ) : (
                      <button
                        onClick={handleRegister}
                        disabled={registering}
                        className="w-full btn-primary flex items-center justify-center gap-2"
                      >
                        {registering ? "Registering..." : "Register Now"}
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    )}
                  </>
                )}

                {!isUpcoming && (
                  <p className="text-center text-muted text-sm">This event has already passed</p>
                )}
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Share This Event</h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copied to clipboard!");
                  }}
                  className="w-full flex items-center justify-center gap-2 border border-border rounded-lg py-3 hover:bg-background transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
