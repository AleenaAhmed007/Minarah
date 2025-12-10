import React from "react";
import MapView from "../components/MapView";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// GLOBAL COLOR PALETTE - Export this to use in other pages
export const colors = {
  // Primary Colors
  primary: '#06b6d4', // cyan-500
  primaryDark: '#0891b2', // cyan-600
  primaryLight: '#67e8f9', // cyan-300
  
  // Accent Colors
  accent: '#10b981', // emerald-500
  accentDark: '#059669', // emerald-600
  danger: '#ef4444', // red-500
  warning: '#f59e0b', // amber-500
  
  // Background Colors
  bgDark: '#0f172a', // slate-900
  bgMedium: '#1e293b', // slate-800
  bgLight: '#334155', // slate-700
  
  // Text Colors
  textPrimary: '#f8fafc', // slate-50
  textSecondary: '#cbd5e1', // slate-300
  textMuted: '#94a3b8', // slate-400
};

function Landing() {
  const features = [
    {
      icon: "🌊",
      title: "Real-Time Monitoring",
      description: "Live updates on water levels, rainfall, and flood conditions across Pakistan"
    },
    {
      icon: "🤖",
      title: "AI Predictions",
      description: "Machine learning algorithms forecast flood risks hours before they occur"
    },
    {
      icon: "🚁",
      title: "Rescue Coordination",
      description: "Connect with emergency services and coordinate relief efforts efficiently"
    },
    {
      icon: "📱",
      title: "Mobile Alerts",
      description: "Receive instant notifications about flood warnings in your area"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* HERO SECTION */}
      <div className="relative w-full min-h-screen overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        >
          <source src="/assets/hero-bg.mp4" type="video/mp4" />
        </video>

        {/* Animated background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-slate-900/80 to-emerald-900/30" />
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="relative z-10 min-h-screen flex flex-col justify-center items-center text-center px-6 py-20">
          {/* Badge */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-300 text-sm font-medium backdrop-blur-sm">
              🇵🇰 Protecting Pakistan's Communities
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Flood Intelligence
            <br />
            <span className="text-4xl md:text-6xl">for Pakistan</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            className="text-slate-300 max-w-3xl mb-10 text-lg md:text-xl leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Real-time monitoring, AI-based predictions, and rescue coordination — 
            empowering citizens and authorities to stay safe.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Link
              to="/signup"
              className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold rounded-xl shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105"
            >
              <span className="flex items-center gap-2">
                Get Started
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
            
            <a
              href="#map"
              className="px-8 py-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-slate-200 font-semibold rounded-xl hover:bg-slate-700/50 hover:border-cyan-500/50 transition-all duration-300"
            >
              View Live Map
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mt-16 grid grid-cols-3 gap-8 md:gap-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            {[
              { value: "24/7", label: "Monitoring" },
              { value: "1000+", label: "Sensors" },
              { value: "98%", label: "Accuracy" }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-cyan-500/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-cyan-500 rounded-full" />
          </div>
        </motion.div>
      </div>

      {/* FEATURES SECTION */}
      <div className="px-4 md:px-10 py-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Comprehensive tools designed to protect lives and property from flood disasters
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="group p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* MAP SECTION */}
      <div id="map" className="px-4 md:px-10 py-20 max-w-7xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Live Pakistan Map
            </h2>
            <p className="text-slate-400 text-lg max-w-3xl">
              Explore flood-prone zones, real-time river flows, risk heatmaps, and weather patterns.
              <span className="block mt-2 text-cyan-400">
                🔒 Login required for detailed local alerts and personalized notifications
              </span>
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 blur-2xl" />
            <div className="relative">
              <MapView visitorMode={true} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* CTA SECTION */}
      <div className="px-4 md:px-10 py-20 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 via-emerald-600 to-cyan-700 p-12 md:p-16 text-center"
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Stay Protected?
            </h2>
            <p className="text-cyan-50 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of citizens and authorities using our platform to prevent flood disasters
            </p>
            <Link
              to="/signup"
              className="inline-block px-8 py-4 bg-white text-cyan-600 font-bold rounded-xl shadow-xl hover:bg-slate-100 transition-all duration-300 hover:scale-105"
            >
              Create Free Account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Landing;