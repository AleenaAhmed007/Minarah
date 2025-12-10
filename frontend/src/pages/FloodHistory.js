import React from "react";
import { motion } from "framer-motion";

function FloodHistory() {
  const majorFloods = [
    {
      year: "2022",
      title: "Catastrophic Monsoon Floods",
      impact: "33 million affected, 1,700+ deaths",
      details: "Extreme monsoon rainfall caused the worst flooding in Pakistan's history, affecting one-third of the country. Sindh and Balochistan were severely impacted.",
      damage: "$30+ billion economic losses"
    },
    {
      year: "2010",
      title: "Super Flood",
      impact: "20 million affected, 2,000+ deaths",
      details: "Record-breaking monsoon rains caused widespread devastation across all provinces. The Indus River breached its banks in multiple locations.",
      damage: "$10 billion economic losses"
    },
    {
      year: "2011",
      title: "Sindh Floods",
      impact: "9 million affected, 500+ deaths",
      details: "Heavy monsoon rains primarily affected Sindh province, destroying crops and infrastructure just as the country was recovering from 2010 floods.",
      damage: "$3.7 billion economic losses"
    },
    {
      year: "2014",
      title: "Punjab & Kashmir Floods",
      impact: "2.5 million affected, 367 deaths",
      details: "Exceptional rainfall in Punjab and Kashmir caused flash floods and landslides. Lahore experienced unprecedented urban flooding.",
      damage: "$4 billion economic losses"
    },
    {
      year: "1992",
      title: "Northern Areas Floods",
      impact: "1 million affected, 1,000+ deaths",
      details: "Heavy monsoon rains caused severe flooding in northern regions, destroying villages and agricultural land.",
      damage: "$1.2 billion economic losses"
    },
    {
      year: "1976",
      title: "Balochistan Flash Floods",
      impact: "500,000 affected, 200+ deaths",
      details: "Intense rainfall led to devastating flash floods in Balochistan, washing away entire settlements.",
      damage: "Extensive infrastructure damage"
    }
  ];

  const statistics = [
    { label: "Total Affected (2010-2022)", value: "65M+", icon: "👥" },
    { label: "Economic Losses", value: "$50B+", icon: "💰" },
    { label: "Major Flood Events", value: "15+", icon: "🌊" },
    { label: "Provinces Affected", value: "All 4", icon: "🗺️" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      {/* Hero Section with Image/Video Background */}
      <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        {/* Background Image - You can replace with actual flood history image */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            /*backgroundImage: "url('/assets/flood-history-bg.jpg')",*/
            backgroundColor: '#1e293b' // Fallback color
          }}
        >
          {/* Optional: Use video instead */}
          {/* <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src="/assets/flood-history.mp4" type="video/mp4" />
          </video> */}
        </div>
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80" />
        
        {/* Title overlay */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-6xl md:text-7xl">📜</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent mb-4">
              History of Floods in Pakistan
            </h1>
            <p className="text-slate-300 text-lg md:text-xl max-w-3xl">
              Pakistan has experienced devastating floods throughout its history, with climate change intensifying their frequency and severity
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 space-y-8">

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statistics.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl hover:border-cyan-500/50 transition-all duration-300"
            >
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="text-3xl font-bold text-cyan-400 mb-1">{stat.value}</div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8"
        >
          <h2 className="text-3xl font-bold text-slate-100 mb-8 flex items-center gap-3">
            <span>⏳</span> Major Flood Events Timeline
          </h2>

          <div className="space-y-6">
            {majorFloods.map((flood, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
                className="relative pl-8 border-l-2 border-cyan-500/30 hover:border-cyan-500 transition-all duration-300"
              >
                {/* Timeline dot */}
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-cyan-500 rounded-full border-4 border-slate-900" />
                
                <div className="bg-slate-700/30 p-6 rounded-lg border border-slate-600 hover:border-cyan-500/50 transition-all duration-300">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="text-3xl font-bold text-cyan-400">{flood.year}</span>
                    <div className="h-6 w-px bg-slate-600" />
                    <h3 className="text-xl font-bold text-slate-100">{flood.title}</h3>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-red-400 font-semibold flex items-center gap-2">
                      <span>📊</span> {flood.impact}
                    </p>
                    <p className="text-amber-400 font-semibold flex items-center gap-2">
                      <span>💵</span> {flood.damage}
                    </p>
                  </div>
                  
                  <p className="text-slate-300 leading-relaxed">{flood.details}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Impact Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-2">
              <span>⚠️</span> Recurring Patterns
            </h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Monsoon season (July-September) is the most vulnerable period</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Sindh and Punjab provinces are most frequently affected</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Riverine floods from Indus River and tributaries</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Urban flooding increasing due to poor drainage systems</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Climate change intensifying rainfall patterns</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <span>🎯</span> Key Learnings
            </h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>Early warning systems save lives and reduce damage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>Community preparedness is crucial for disaster response</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>Investment in flood infrastructure reduces economic losses</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>Better urban planning prevents catastrophic city flooding</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>Climate adaptation strategies are essential for the future</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Historical Context */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8"
        >
          <h2 className="text-3xl font-bold text-slate-100 mb-6 flex items-center gap-3">
            <span>📖</span> Understanding Pakistan's Flood Vulnerability
          </h2>
          <div className="space-y-4 text-slate-300 leading-relaxed">
            <p>
              Pakistan lies in a region highly susceptible to flooding due to its geography, climate, and the mighty Indus River system. The country experiences two main types of floods: riverine floods from glacial melt and monsoon rainfall, and flash floods in mountainous regions.
            </p>
            <p>
              The frequency and intensity of floods have increased dramatically since the 1990s, primarily due to climate change, deforestation, and poor water management infrastructure. The 2010 floods marked a turning point, affecting one-fifth of Pakistan's land area and displacing millions.
            </p>
            <p>
              The 2022 floods were unprecedented in scale, with some areas receiving 5-7 times their normal annual rainfall in just a few months. This disaster highlighted the urgent need for climate adaptation strategies, improved early warning systems, and community resilience building.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

export default FloodHistory;