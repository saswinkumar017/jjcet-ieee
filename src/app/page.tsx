"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, Calendar, Users, ChevronRight,
  Clock, Zap, Target, Rocket, Star, User, Sparkles
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { eventsService } from "@/client/services";
import { useAuth } from "@/lib/AuthContext";
import { Event } from "@/types";
import { FadeIn, Stagger, StaggerItem, ScrollReveal } from "@/components/ui/animations";
import { Section } from "@/components/ui/Container";
import { ImageSlider } from "@/components/ImageSlider";

const campusImages = [
  "/jjcet-campus-1.jpg",
  "/jjcet-campus-2.jpg",
  "/jjcet-campus-3.jpg",
  "/jjcet-campus-4.jpg",
  "/jjcet-campus-5.jpg",
];

// Features data
const features = [
  { icon: Zap, title: "Innovation", description: "Cutting-edge technical events and workshops" },
  { icon: Target, title: "Leadership", description: "Build leadership skills through team projects" },
  { icon: Rocket, title: "Career", description: "Professional growth and networking opportunities" },
  { icon: Star, title: "Excellence", description: "Award-winning student projects and research" },
];


// Particle component for hero
function Particle({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        y: [0, -100, -200],
      }}
      transition={{ 
        duration: 8, 
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="absolute w-2 h-2 bg-accent/30 rounded-full"
      style={{
        left: `${Math.random() * 100}%`,
        bottom: 0,
      }}
    />
  );
}

// Floating shapes
function FloatingShape({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: 0 }}
      animate={{ 
        opacity: [0.1, 0.2, 0.1],
        scale: [1, 1.1, 1],
        rotate: [0, 180, 360],
      }}
      transition={{ 
        duration: 20, 
        delay,
        repeat: Infinity,
        ease: "linear"
      }}
      className={className}
    />
  );
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);


  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Hero section scroll animation
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsData = await eventsService.getAll();
        setEvents(eventsData.slice(0, 3));




      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);



  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* College Campus Background Slideshow */}
        <div className="absolute inset-0">
          <ImageSlider 
            images={campusImages} 
            interval={5000}
            showDots={true}
            showArrows={false}
          />
          {/* Solid Blue Overlay - dims the images */}
          <div className="absolute inset-0 bg-primary/85 z-10"></div>
        </div>

        {/* Hero Content */}
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 w-full container-custom py-16 md:py-24 lg:py-32"
        >
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full mb-8 border-2 border-white/30">
                <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                <span className="text-sm font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Empowering Future Engineers</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
            >
              JJCET IEEE
              <span className="block mt-2 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                Student Branch
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-base md:text-lg text-white/90 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            >
              Where innovation meets opportunity. Join a community of future leaders 
              shaping technology for a better tomorrow.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link 
                  href="/events" 
                  className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-foreground font-bold rounded-xl border-2 border-white/50 hover:shadow-[0_0_20px_rgba(255,185,0,0.6)] hover:-translate-y-1 transition-all drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                >
                  Explore Events 
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                {user ? (
                  <Link 
                    href="/dashboard" 
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-white hover:bg-white/30 hover:border-white transition-all drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                  >
                    <User className="w-5 h-5" />
                    My Dashboard
                  </Link>
                ) : (
                  <Link 
                    href="/register" 
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-white hover:bg-white/30 hover:border-white transition-all drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                  >
                    Become a Member
                  </Link>
                )}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="var(--background)"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <Section padding="lg" className="bg-background">
        <div className="container-custom">
          <FadeIn>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <FadeIn key={index} delay={index * 0.1} direction="up">
                  <motion.div
                    whileHover={{ y: -10, transition: { duration: 0.3 } }}
                    className="group glass-card p-6 rounded-2xl"
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${
                      index === 0 ? "bg-gradient-to-br from-purple-500 to-purple-700" :
                      index === 1 ? "bg-gradient-to-br from-pink-500 to-rose-600" :
                      index === 2 ? "bg-gradient-to-br from-cyan-500 to-blue-600" :
                      "bg-gradient-to-br from-amber-500 to-orange-600"
                    }`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted text-sm">{feature.description}</p>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </FadeIn>
        </div>
      </Section>


      {/* Upcoming Events Section */}
      <Section padding="lg" className="bg-backgroundbg-slate-900">
        <div className="container-custom">
          <FadeIn>
            <div className="flex justify-between items-start mb-8 md:mb-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-4">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Upcoming Events</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">Latest Events</h2>
              </div>
              <Link 
                href="/events" 
                className="hidden md:flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
              >
                View All <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [...Array(3)].map((_, index) => (
                <div key={index} className="bg-surface rounded-2xl border border-border overflow-hidden">
                  <div className="aspect-video bg-muted/20 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-muted/20 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-muted/20 rounded w-full animate-pulse" />
                  </div>
                </div>
              ))
            ) : events.length > 0 ? (
              events.map((event, index) => (
                <FadeIn key={event.id} delay={index * 0.1} direction="up">
                  <Link href={`/events/${event.id}`}>
                    <motion.div
                      whileHover={{ y: -10 }}
                      className="group bg-surface rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="aspect-video relative overflow-hidden">
                        {event.imageUrl ? (
                          <img 
                            src={event.imageUrl} 
                            alt={event.title} 
                            className="w-full h-full object-contain bg-muted/20" 
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <Calendar className="w-16 h-16 text-primary/30" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4 bg-primary text-white px-4 py-2 rounded-xl font-bold">
                          {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-muted text-sm mb-4 line-clamp-2">{event.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-sm text-muted">
                            <Clock className="w-4 h-4" />{event.time}
                          </span>
                          <span className="text-primary font-semibold text-sm">Details →</span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </FadeIn>
              ))
            ) : (
              <div className="col-span-full text-center py-16 px-4">
                <div className="w-20 h-20 mx-auto mb-4 bg-muted/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-muted" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No Upcoming Events</h3>
                <p className="text-muted mb-6">Check back soon for new events</p>
                <Link href="/events" className="btn-primary">
                  View All Events
                </Link>
              </div>
            )}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link href="/events" className="inline-flex items-center gap-2 text-primary font-semibold">
              View All Events <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </Section>


      {/* CTA Section */}
      <section className="relative py-12 md:py-20 overflow-hidden bg-gradient-to-r from-primary to-primary-hover">
        <div className="absolute inset-0 opacity-10" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} 
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-4xl mx-auto text-center px-4"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join IEEE Today
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Become a member of the world's largest technical professional organization 
            and unlock endless opportunities for your career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link 
                href="/register" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-foreground font-bold rounded-xl hover:shadow-accent hover:-translate-y-1 transition-all"
              >
                Register Now
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 px-8 py-4 text-lg font-bold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 hover:border-white/50 transition-all"
              >
                Contact Us
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </>
  );
}
