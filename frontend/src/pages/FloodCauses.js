import React, { useState } from "react";
import { motion } from "framer-motion";

function FloodCauses() {
  const [selectedCategory, setSelectedCategory] = useState('natural');

  const naturalCauses = [
    {
      icon: "🌧️",
      title: "Heavy Monsoon Rainfall",
      description: "Intense rainfall during monsoon season (July-September) overwhelms drainage systems and causes rivers to overflow.",
      severity: "Critical",
      impact: "Affects entire provinces, causes widespread flooding"
    },
    {
      icon: "🏔️",
      title: "Glacial Lake Outburst Floods (GLOFs)",
      description: "Sudden release of water from glacial lakes in the Himalayas and Karakoram ranges due to rising temperatures.",
      severity: "High",
      impact: "Devastating flash floods in northern regions"
    },
    {
      icon: "❄️",
      title: "Snow & Ice Melt",
      description: "Rapid melting of snow and glaciers during summer increases river flow, especially in the Indus River system.",
      severity: "High",
      impact: "Gradual but sustained water level rise"
    },
    {
      icon: "🌊",
      title: "River Overflow",
      description: "The Indus River and its tributaries overflow when receiving excessive water from rainfall and glacial melt.",
      severity: "Critical",
      impact: "Floods agricultural lands and populated areas"
    },
    {
      icon: "🌀",
      title: "Cyclones & Tropical Storms",
      description: "Cyclonic systems from the Arabian Sea bring heavy rainfall to coastal and inland areas.",
      severity: "Medium",
      impact: "Coastal flooding and storm surges"
    },
    {
      icon: "⛰️",
      title: "Flash Floods",
      description: "Sudden, intense rainfall in mountainous regions causes rapid water accumulation in valleys.",
      severity: "High",
      impact: "Immediate devastation with little warning"
    }
  ];

  const humanCauses = [
    {
      icon: "🏗️",
      title: "Poor Urban Planning",
      description: "Unplanned construction on floodplains and natural drainage routes blocks water flow.",
      severity: "High",
      impact: "Urban flooding in cities like Karachi and Lahore"
    },
    {
      icon: "🌳",
      title: "Deforestation",
      description: "Cutting down forests reduces soil's water absorption capacity and increases surface runoff.",
      severity: "Critical",
      impact: "Accelerated flooding and soil erosion"
    },
    {
      icon: "🚜",
      title: "Agricultural Practices",
      description: "Improper irrigation and land use reduce natural water retention and alter drainage patterns.",
      severity: "Medium",
      impact: "Changed water flow patterns"
    },
    {
      icon: "🏭",
      title: "Climate Change",
      description: "Human-induced global warming intensifies rainfall patterns and accelerates glacial melt.",
      severity: "Critical",
      impact: "Increasing flood frequency and intensity"
    },
    {
      icon: "🔧",
      title: "Inadequate Infrastructure",
      description: "Outdated or insufficient drainage systems, dams, and flood management infrastructure.",
      severity: "High",
      impact: "Reduced flood control capacity"
    },
    {
      icon: "🗑️",
      title: "Poor Waste Management",
      description: "Garbage and debris block drainage channels, preventing water from flowing freely.",
      severity: "Medium",
      impact: "Localized urban flooding"
    }
  ];

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'Critical': return 'text-red-400 bg-red-500/20 border-red-500/40';
      case 'High': return 'text-orange-400 bg-orange-500/20 border-orange-500/40';
      case 'Medium': return 'text-amber-400 bg-amber-500/20 border-amber-500/40';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/40';
    }
  };

  const currentCauses = selectedCategory === 'natural' ? naturalCauses : humanCauses;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">🔍</span>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Causes of Floods in Pakistan
            </h1>
          </div>
          <p className="text-slate-400 text-lg">
            Understanding the natural and human factors that contribute to flooding in Pakistan
          </p>
        </motion.div>

        {/* Category Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap gap-4"
        >
          <button
            onClick={() => setSelectedCategory('natural')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              selectedCategory === 'natural'
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg scale-105'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>🌍</span> Natural Causes
            </span>
          </button>
          <button
            onClick={() => setSelectedCategory('human')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              selectedCategory === 'human'
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg scale-105'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>👥</span> Human-Induced Causes
            </span>
          </button>
        </motion.div>

        {/* Causes Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {currentCauses.map((cause, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">{cause.icon}</div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(cause.severity)}`}>
                  {cause.severity}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-100 mb-3">{cause.title}</h3>
              <p className="text-slate-300 text-sm mb-4 leading-relaxed">{cause.description}</p>
              
              <div className="pt-4 border-t border-slate-600">
                <p className="text-xs text-slate-400 font-semibold mb-1">Impact:</p>
                <p className="text-sm text-cyan-400">{cause.impact}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Interconnection Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-8"
        >
          <h2 className="text-3xl font-bold text-purple-300 mb-6 flex items-center gap-3">
            <span>🔗</span> How Causes Interconnect
          </h2>
          <div className="space-y-4 text-slate-300 leading-relaxed">
            <p>
              Floods in Pakistan result from a complex interaction between natural and human factors. Climate change amplifies natural events by increasing rainfall intensity and accelerating glacial melt.
            </p>
            <p>
              Deforestation and poor urban planning worsen the impact by reducing natural water absorption and blocking drainage routes. When heavy monsoon rains coincide with glacial melt, the Indus River system becomes overwhelmed.
            </p>
            <p>
              Understanding these interconnected causes is crucial for developing effective flood prevention and mitigation strategies. Addressing human-induced factors while preparing for natural events can significantly reduce flood risk.
            </p>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          className="grid md:grid-cols-4 gap-4"
        >
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
            <div className="text-4xl mb-2">🌧️</div>
            <div className="text-3xl font-bold text-cyan-400 mb-1">500%</div>
            <div className="text-slate-400 text-sm">Rainfall increase in 2022</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
            <div className="text-4xl mb-2">🌳</div>
            <div className="text-3xl font-bold text-red-400 mb-1">42%</div>
            <div className="text-slate-400 text-sm">Forest cover lost</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
            <div className="text-4xl mb-2">❄️</div>
            <div className="text-3xl font-bold text-orange-400 mb-1">3,000+</div>
            <div className="text-slate-400 text-sm">Glaciers melting</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
            <div className="text-4xl mb-2">🏙️</div>
            <div className="text-3xl font-bold text-amber-400 mb-1">65%</div>
            <div className="text-slate-400 text-sm">Urban population at risk</div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

export default FloodCauses;