import React from "react";
import { Link } from "react-router-dom";
import { 
  Mail, 
  Phone, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  Heart
} from "lucide-react";

function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Flood History", path: "/FloodHistory" },
    { name: "Prevention", path: "/FloodPrevention" }
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Instagram, href: "#", label: "Instagram" }
  ];

  return (
    <footer className="w-full bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800">
      
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <img 
                  src="\assets\logo.jpeg" 
                  className="w-10 h-10 rounded-full ring-2 ring-cyan-500/30" 
                  alt="Minarah logo" 
                />
                <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-md" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Minarah
              </h2>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Flood Intelligence & Early Warning System protecting communities across Pakistan.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-slate-100 font-semibold mb-4 text-sm">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <Link 
                    to={link.path} 
                    className="text-slate-400 text-sm hover:text-cyan-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-slate-100 font-semibold mb-4 text-sm">Get in Touch</h3>
            <div className="space-y-3 mb-4">
              <a href="mailto:info@minarah.pk" className="flex items-center gap-2 text-slate-400 text-sm hover:text-cyan-400 transition-colors">
                <Mail className="w-4 h-4" />
                info@minarah.pk
              </a>
              <a href="tel:+92123456789" className="flex items-center gap-2 text-slate-400 text-sm hover:text-cyan-400 transition-colors">
                <Phone className="w-4 h-4" />
                +92 123 456 789
              </a>
            </div>
            
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social, idx) => {
                const Icon = social.icon;
                return (
                  <a
                    key={idx}
                    href={social.href}
                    aria-label={social.label}
                    className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all duration-300"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-slate-400 text-sm">
              © {currentYear} <span className="text-cyan-400 font-semibold">Minarah</span>. All rights reserved.
            </p>
            <p className="text-slate-500 text-sm flex items-center gap-1">
              Built with <Heart className="w-3 h-3 text-red-500 fill-current animate-pulse" /> in Pakistan
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      
    </footer>
  );
}

export default Footer;