import React from "react";
import { motion } from "framer-motion";

function AboutUs() {
  const aims = [
    {
      icon: "🎯",
      title: "Save Lives",
      description: "Provide early warnings and real-time alerts to help people evacuate before floods strike, minimizing casualties."
    },
    {
      icon: "📊",
      title: "Data-Driven Decisions",
      description: "Empower authorities with accurate, AI-powered flood predictions and analytics for better disaster management."
    },
    {
      icon: "🤝",
      title: "Community Empowerment",
      description: "Enable citizens to request help, access resources, and stay informed during flood emergencies."
    },
    {
      icon: "🌍",
      title: "National Resilience",
      description: "Build a flood-resilient Pakistan through technology, preparedness, and coordinated response systems."
    }
  ];

  const features = [
    {
      icon: "🗺️",
      title: "Live Flood Mapping",
      description: "Interactive maps showing real-time flood zones, water levels, and affected areas across Pakistan"
    },
    {
      icon: "🤖",
      title: "AI Predictions",
      description: "Machine learning algorithms analyze weather patterns, river flows, and historical data to forecast floods"
    },
    {
      icon: "🚨",
      title: "SOS System",
      description: "One-click emergency alerts connecting citizens with rescue teams and emergency services"
    },
    {
      icon: "📱",
      title: "SMS & App Alerts",
      description: "Multi-channel notifications ensuring warnings reach everyone, even in low-connectivity areas"
    },
    {
      icon: "👥",
      title: "Rescue Coordination",
      description: "Platform for rescue teams to manage operations, track requests, and optimize resource deployment"
    },
    {
      icon: "📈",
      title: "Analytics Dashboard",
      description: "Comprehensive insights for administrators to monitor situations and make informed decisions"
    }
  ];

  const plans = [
    {
      phase: "Phase 1",
      title: "Foundation & Launch",
      status: "In Progress",
      items: [
        "Deploy early warning system in high-risk areas",
        "Establish partnerships with NDMA and provincial authorities",
        "Launch citizen and rescue team mobile apps",
        "Install IoT sensors in critical flood zones"
      ]
    },
    {
      phase: "Phase 2",
      title: "Expansion & Integration",
      status: "Upcoming",
      items: [
        "Expand coverage to all provinces and districts",
        "Integrate with satellite imagery for flood detection",
        "Develop multilingual support (Urdu, Sindhi, Punjabi, Pashto)",
        "Create community volunteer network"
      ]
    },
    {
      phase: "Phase 3",
      title: "Advanced Features",
      status: "Future",
      items: [
        "Implement drone surveillance for assessment",
        "Build predictive models using climate data",
        "Establish automated relief supply distribution",
        "Create virtual reality training for rescue teams"
      ]
    }
  ];

  const importance = [
    {
      stat: "33M",
      label: "People Affected",
      description: "2022 floods impacted 1/3 of Pakistan"
    },
    {
      stat: "$30B+",
      label: "Economic Losses",
      description: "Devastating financial impact on economy"
    },
    {
      stat: "Minutes",
      label: "Early Warning Critical",
      description: "Minutes can save thousands of lives"
    },
    {
      stat: "Every Year",
      label: "Recurring Crisis",
      description: "Pakistan faces floods annually"
    }
  ];

  const team = [
    {
      role: "Mission",
      icon: "🎯",
      description: "To protect Pakistani communities from flood disasters through innovative technology and timely information"
    },
    {
      role: "Vision",
      icon: "🔮",
      description: "A flood-resilient Pakistan where every citizen has access to life-saving early warnings and emergency support"
    },
    {
      role: "Values",
      icon: "💎",
      description: "Innovation, Compassion, Transparency, Collaboration, and Commitment to saving lives"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      {/* Hero Section with Video/Image Background */}
      <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        >
          <source src="/assets/about-hero.mp4" type="video/mp4" />
        </video>
        
        {/* Fallback gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/60 via-slate-900/80 to-emerald-900/60" />
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <img 
                src="/assets/logo.jpeg" 
                className="w-16 h-16 rounded-full ring-4 ring-cyan-500/50" 
                alt="Minarah logo" 
              />
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                Minarah
              </h1>
            </div>
            <p className="text-2xl md:text-3xl text-cyan-200 font-semibold mb-4">
              Flood Intelligence & Early Warning System
            </p>
            <p className="text-slate-300 text-lg md:text-xl leading-relaxed">
              Protecting Pakistani communities through AI-powered predictions, real-time monitoring, and coordinated emergency response
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 space-y-16">

        {/* Mission, Vision, Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid md:grid-cols-3 gap-6">
            {team.map((item, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-cyan-500/50 transition-all duration-300"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-bold text-cyan-400 mb-3">{item.role}</h3>
                <p className="text-slate-300 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Why Minarah is Important */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Why Minarah Matters
          </h2>
          <p className="text-slate-400 text-center text-lg mb-12 max-w-3xl mx-auto">
            Pakistan is one of the most flood-vulnerable countries in the world. Minarah exists to change that.
          </p>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {importance.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl p-6 text-center"
              >
                <div className="text-4xl font-bold text-red-400 mb-2">{item.stat}</div>
                <div className="text-xl font-semibold text-slate-100 mb-2">{item.label}</div>
                <div className="text-sm text-slate-400">{item.description}</div>
              </motion.div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 border border-cyan-500/30 rounded-xl p-8">
            <p className="text-slate-300 text-lg leading-relaxed text-center">
              Every year, floods devastate Pakistani communities, destroying homes, livelihoods, and lives. 
              With climate change intensifying weather patterns, the situation is getting worse. 
              <span className="block mt-4 text-cyan-400 font-semibold">
                Minarah bridges the gap between technology and disaster response, ensuring no one is left behind when floods strike.
              </span>
            </p>
          </div>
        </motion.div>

        {/* Our Aims */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Our Aims
          </h2>
          <p className="text-slate-400 text-center text-lg mb-12">
            Four core objectives driving everything we do
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {aims.map((aim, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{aim.icon}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-100 mb-2">{aim.title}</h3>
                    <p className="text-slate-300 leading-relaxed">{aim.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Key Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            What We Offer
          </h2>
          <p className="text-slate-400 text-center text-lg mb-12">
            Comprehensive tools designed to protect and empower
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Our Plans */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Roadmap & Future Plans
          </h2>
          <p className="text-slate-400 text-center text-lg mb-12">
            Our journey towards a flood-resilient Pakistan
          </p>

          <div className="space-y-6">
            {plans.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-cyan-500/50 transition-all duration-300"
              >
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className="text-3xl font-bold text-cyan-400">{plan.phase}</span>
                  <div className="h-8 w-px bg-slate-600" />
                  <h3 className="text-2xl font-bold text-slate-100">{plan.title}</h3>
                  <span className={`ml-auto px-4 py-1.5 rounded-full text-sm font-semibold ${
                    plan.status === 'In Progress' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : plan.status === 'Upcoming'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                  }`}>
                    {plan.status}
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {plan.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-cyan-400 mt-1">✓</span>
                      <span className="text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 via-emerald-600 to-cyan-700 p-12 md:p-16 text-center"
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Join Us in Building a Safer Pakistan
            </h2>
            <p className="text-cyan-50 text-lg mb-8 max-w-2xl mx-auto">
              Whether you're a citizen, rescue worker, or organization, you can be part of the solution
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-8 py-4 bg-white text-cyan-600 font-bold rounded-xl shadow-xl hover:bg-slate-100 transition-all duration-300 hover:scale-105">
                Get Started Today
              </button>
              <button className="px-8 py-4 bg-slate-800/50 backdrop-blur-sm border-2 border-white/50 text-white font-bold rounded-xl hover:bg-slate-700/50 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

export default AboutUs;