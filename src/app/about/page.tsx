"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { membersService } from "@/client/services";
import { TeamMember } from "@/types";
import { FadeIn, Card as PremiumCard, Badge } from "@/components/ui/PremiumComponents";
import { Award, Users, Calendar, MapPin, Phone, Mail, GraduationCap, BookOpen, Target, Rocket, Sparkles, CheckCircle, Star, Globe, TrendingUp } from "lucide-react";

const stats = [
  { icon: Award, label: "Years Established", value: "30+" },
  { icon: GraduationCap, label: "UG Programs", value: "9" },
  { icon: TrendingUp, label: "Placement Rate", value: "91%" },
  { icon: Users, label: "IEEE Members", value: "" },
];

const values = [
  { icon: Target, title: "Innovation", description: "Encouraging creative solutions and cutting-edge research" },
  { icon: Rocket, title: "Excellence", description: "Striving for the highest standards in technical achievement" },
  { icon: Users, title: "Collaboration", description: "Working together to solve real-world challenges" },
  { icon: BookOpen, title: "Learning", description: "Continuous knowledge sharing and skill development" },
];


export default function AboutPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await membersService.getAll();
        setMembers(data);
      } catch (error) {
        console.error("Failed to fetch members", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-14 md:py-24 overflow-hidden bg-gradient-to-br from-primary via-primary-hover to-[#003a5e]">
        <div className="absolute inset-0 opacity-10" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} 
        />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/20 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 right-1/3 w-60 h-60 bg-purple-400/10 rounded-full blur-[80px]"></div>
        
        <div className="container-custom relative z-10">
          <FadeIn>
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full mb-8 border border-white/20">
                <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                <span className="text-sm font-medium text-white/90">About Us</span>
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Empowering Future Engineers
              </h1>
              <p className="text-base md:text-xl text-white/80">
                JJCET IEEE Student Branch - Where innovation meets opportunity and leadership takes shape.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* About Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <FadeIn direction="left">
              <div className="relative">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl glass-card">
                  <img 
                    src="/jjcet-campus-b3.jpeg" 
                    alt="JJCET Campus"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 glass-card p-6 rounded-2xl hidden sm:block">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Star className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-lg">Since 2024</p>
                      <p className="text-sm text-muted">IEEE Student Branch</p>
                    </div>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-2xl"></div>
              </div>
            </FadeIn>

            <FadeIn direction="right" delay={200}>
              <div>
                <Badge variant="primary" className="mb-4">Our Story</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  About JJCET IEEE Student Branch
                </h2>
                <div className="space-y-4 text-muted">
                  <p>
                    The IEEE Student Branch at J.J. College of Engineering and Technology (JJCET) 
                    was established in 2024 (Student Branch Code: STB60971) under the IEEE Madras Section, 
                    Tamilnadu Subsection with a vision to foster technical excellence and 
                    professional growth among engineering students.
                  </p>
                  <p>
                    Under the guidance of our branch counselor and dedicated student leaders, 
                    we organize workshops, seminars, hackathons, and networking events that 
                    bridge the gap between academia and industry.
                  </p>
                  <p>
                    Our mission is to provide a platform for students to explore innovations, 
                    develop leadership skills, and build networks that last throughout their careers.
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Technical Workshops</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Industry Connect</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Research Opportunities</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-whitebg-slate-800">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <FadeIn delay={0}>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <p className="text-3xl md:text-4xl font-bold text-foregroundtext-white">30+</p>
                <p className="text-mutedtext-slate-400 font-medium">Years Established</p>
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <p className="text-3xl md:text-4xl font-bold text-foregroundtext-white">9</p>
                <p className="text-mutedtext-slate-400 font-medium">UG Programs</p>
              </div>
            </FadeIn>
            <FadeIn delay={200}>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <p className="text-3xl md:text-4xl font-bold text-foregroundtext-white">91%</p>
                <p className="text-mutedtext-slate-400 font-medium">Placement Rate</p>
              </div>
            </FadeIn>
            <FadeIn delay={300}>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <p className="text-3xl md:text-4xl font-bold text-foregroundtext-white">
                  {loading ? "..." : `${members.length}+`}
                </p>
                <p className="text-mutedtext-slate-400 font-medium">IEEE Members</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-backgroundbg-slate-900">
        <div className="container-custom">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Badge variant="success" className="mb-4">What We Stand For</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our Core Values
              </h2>
              <p className="text-muted">
                Guided by IEEE's global mission, we uphold these values in everything we do.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <FadeIn key={index} delay={index * 100}>
                <PremiumCard className="p-6 text-center group hover:border-primary/30">
                  <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <value.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{value.title}</h3>
                  <p className="text-muted text-sm">{value.description}</p>
                </PremiumCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>


      {/* Team Preview */}
      <section className="section-padding bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container-custom">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Badge variant="primary" className="mb-4">Leadership</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Meet Our Team
              </h2>
              <p className="text-muted">
                The driving force behind JJCET IEEE Student Branch
              </p>
            </div>
          </FadeIn>

          {!loading && members.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {members.slice(0, 4).map((member, index) => (
                <FadeIn key={member.id} delay={index * 100}>
                  <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    {/* Gradient Header */}
                    <div className="h-24 bg-gradient-to-br from-primary via-primary-hover to-[#003a5e] relative">
                      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
                    </div>
                    
                    {/* Avatar */}
                    <div className="relative -mt-12 px-6">
                      <div className="relative">
                        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden ring-4 ring-white shadow-xl bg-white">
                          {member.photoUrl ? (
                            <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                              <Users className="w-10 h-10 text-white" />
                            </div>
                          )}
                        </div>
                        {/* Member Type Badge */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-accent text-foreground text-xs font-bold rounded-full shadow-lg">
                          {member.memberType || 'Student'}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 pt-4 text-center">
                      <h3 className="font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-primary text-sm font-semibold mb-2">{member.role}</p>
                      
                      {/* Member Type Badge */}
                      <div className="flex justify-center gap-1 mb-3">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${member.memberType === 'faculty' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {member.memberType === 'faculty' ? 'Faculty' : 'Student'}
                        </span>
                      </div>

                      {/* Contact Icons */}
                      <div className="flex justify-center gap-3 mt-3">
                        {member.email && (
                          <a href={`mailto:${member.email}`} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-primary hover:text-white transition-colors">
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                        {member.linkedin && (
                          <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-blue-600 hover:text-white transition-colors">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-muted">Team members will appear here once added.</p>
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/members" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-colors shadow-lg hover:shadow-xl">
              View All Members <Rocket className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-14 md:py-24 overflow-hidden bg-gradient-to-br from-primary via-primary-hover to-[#003a5e]">
        <div className="absolute inset-0 opacity-10" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} 
        />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/20 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 right-1/3 w-60 h-60 bg-purple-400/10 rounded-full blur-[80px]"></div>
        
        <div className="container-custom relative z-10 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Join Our Community
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">
              Be part of something bigger. Connect with fellow innovators and leaders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="px-8 py-4 bg-accent text-foreground font-bold rounded-xl hover:shadow-glow-accent hover:-translate-y-1 transition-all">
                Register Now
              </Link>
              <Link href="/contact" className="px-8 py-4 text-white font-bold border-2 border-white/30 rounded-xl hover:bg-white/10 hover:border-white/50 transition-all">
                Contact Us
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </>
  );
}
