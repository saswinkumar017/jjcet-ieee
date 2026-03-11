import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Youtube, ArrowRight } from "lucide-react";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "Events", href: "/events" },
  { name: "Members", href: "/members" },
  { name: "Gallery", href: "/gallery" },
  { name: "Contact", href: "/contact" },
];

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "hhttps://www.facebook.com/SowdambikaaJJCET/" },
  { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/sowdambikaajjcet/" },
  { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/school/15120055/admin/dashboard" },
  { name: "YouTube", icon: Youtube, href: "https://youtube.com/@jjcet1994" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
      
      <div className="container-custom py-10 md:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white p-1">
                <img src="/favicon.png" alt="JJCET IEEE" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-lg font-bold">JJCET IEEE</h3>
                <p className="text-xs text-gray-400">Student Branch</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              J.J. College of Engineering & Technology (JJCET) was established in 1994. Affiliated to Anna University, Chennai and approved by AICTE.
            </p>
            <p className="text-gray-400 text-sm">
              <a href="https://jjcet.ac.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                www.jjcet.ac.in
              </a>
            </p>
            <div className="flex gap-4 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary/80 transition-all duration-300 hover:scale-110"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <span className="text-gray-400 text-sm">
                  J.J. College of Engineering & Technology<br />
                  Ammapettai Village, NH-45<br />
                  Tiruchirappalli, Tamil Nadu
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <a href="mailto:ieee@jjcet.ac.in" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  ieee@jjcet.ac.in
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-gray-400 text-sm">
                  +91 98428 11776
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-gray-400 text-sm">
                  +91 98652 11776
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 md:mt-12 pt-6 md:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2026 JJCET IEEE Student Branch. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
