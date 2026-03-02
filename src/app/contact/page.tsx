"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FadeIn } from "@/components/ui/animations";

export default function ContactPage() {

  return (
    <>
      <Header />

      <section className="relative bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10" 
          style={{ backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 1px, transparent 1px)`, backgroundSize: '50px 50px' }} 
        />
        <div className="absolute top-10 right-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        
        <div className="container-custom relative z-10">
          <FadeIn>
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm mb-6">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Get in Touch</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
              <p className="text-lg text-white/90 leading-relaxed">
                Have questions or want to get in touch with JJCET IEEE Student Branch? 
                We'd love to hear from you.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-backgroundbg-slate-900">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <FadeIn>
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Get in Touch</h2>
                  <p className="text-muted leading-relaxed">
                    Feel free to reach out to us for any queries related to IEEE membership, 
                    events, workshops, or collaborations.
                  </p>
                </div>

                <div className="space-y-6">
                  <motion.div whileHover={{ x: 5 }} className="flex items-start gap-5 p-4 bg-surface rounded-2xl border border-border hover:border-primary/30 transition-all">
                    <div className="w-14 h-14 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <MapPin className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Address</h3>
                      <p className="text-muted leading-relaxed">
                        J.J. College of Engineering and Technology,<br />
                        Ammapettai, Poolangulathupatti (PO),<br />
                        Tiruchirappalli, Tamil Nadu - 620009
                      </p>
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ x: 5 }} className="flex items-start gap-5 p-4 bg-surface rounded-2xl border border-border hover:border-primary/30 transition-all">
                    <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <Phone className="w-7 h-7 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Phone</h3>
                      <p className="text-muted">
                        <a href="tel:9842811776" className="hover:text-primary transition-colors">+91 98428 11776</a>
                      </p>
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ x: 5 }} className="flex items-start gap-5 p-4 bg-surface rounded-2xl border border-border hover:border-primary/30 transition-all">
                    <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <Mail className="w-7 h-7 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Email</h3>
                      <p className="text-muted">
                        <a href="mailto:principal@jjcet.ac.in" className="hover:text-primary transition-colors">principal@jjcet.ac.in</a>
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
