import React, { useState } from "react";
import { motion } from "framer-motion";

function FloodPrevention() {
  const [selectedTab, setSelectedTab] = useState('before');

  const beforeFlood = [
    {
      icon: "📱",
      title: "Stay Informed",
      actions: [
        "Monitor weather forecasts and flood warnings regularly",
        "Download emergency alert apps like Minarah",
        "Follow official government social media accounts",
        "Sign up for SMS flood alerts in your area"
      ]
    },
    {
      icon: "🎒",
      title: "Prepare Emergency Kit",
      actions: [
        "First aid supplies and necessary medications",
        "Non-perishable food and bottled water (3-day supply)",
        "Flashlights, batteries, and portable phone charger",
        "Important documents in waterproof container",
        "Cash, warm clothes, and basic hygiene items"
      ]
    },
    {
      icon: "🏠",
      title: "Secure Your Home",
      actions: [
        "Clear gutters and drainage systems",
        "Move valuables to higher floors",
        "Install water barriers or sandbags if available",
        "Know how to shut off utilities (gas, electricity, water)",
        "Seal basement walls with waterproofing compounds"
      ]
    },
    {
      icon: "🗺️",
      title: "Plan Evacuation",
      actions: [
        "Identify evacuation routes and safe zones",
        "Know location of nearest relief camps",
        "Establish family communication plan",
        "Keep vehicle fueled and ready",
        "Memorize emergency contact numbers"
      ]
    }
  ];

  const duringFlood = [
    {
      icon: "🚨",
      title: "Immediate Safety",
      actions: [
        "Move to higher ground immediately if flooding begins",
        "Never walk or drive through floodwater",
        "Avoid contact with electrical equipment if wet",
        "Stay away from power lines and damaged buildings",
        "Do not touch floodwater - it may be contaminated"
      ]
    },
    {
      icon: "🆘",
      title: "Emergency Response",
      actions: [
        "Call emergency services if life is threatened",
        "Use SOS features in emergency apps",
        "Stay on rooftops if unable to evacuate safely",
        "Signal for help using bright cloth or flashlight",
        "Keep phone battery conserved for emergencies"
      ]
    },
    {
      icon: "🏘️",
      title: "Shelter Safety",
      actions: [
        "Follow instructions from rescue authorities",
        "Stay in designated safe zones",
        "Keep children and elderly safe and warm",
        "Ration food and water supplies wisely",
        "Help neighbors who need assistance"
      ]
    },
    {
      icon: "📻",
      title: "Stay Connected",
      actions: [
        "Listen to battery-powered radio for updates",
        "Conserve phone battery for critical communication",
        "Inform family of your location when safe",
        "Follow official evacuation orders immediately",
        "Share your status on social media if possible"
      ]
    }
  ];

  const afterFlood = [
    {
      icon: "⚠️",
      title: "Return Safely",
      actions: [
        "Only return home when authorities say it's safe",
        "Watch for structural damage and unstable buildings",
        "Wear protective gear (boots, gloves, mask)",
        "Document damage with photos for insurance",
        "Be cautious of wild animals and snakes"
      ]
    },
    {
      icon: "🔌",
      title: "Check Utilities",
      actions: [
        "Have electrician check system before restoring power",
        "Check for gas leaks - leave immediately if smell gas",
        "Inspect water and sewage lines for damage",
        "Don't use electrical appliances if wet",
        "Discard contaminated food and medicines"
      ]
    },
    {
      icon: "🧹",
      title: "Clean Up",
      actions: [
        "Remove water and mud immediately to prevent mold",
        "Disinfect everything touched by floodwater",
        "Dry out building within 24-48 hours if possible",
        "Remove wet carpets, insulation, and drywall",
        "Hire professionals for extensive damage"
      ]
    },
    {
      icon: "💊",
      title: "Health Precautions",
      actions: [
        "Get medical attention for injuries immediately",
        "Boil water before drinking until declared safe",
        "Watch for symptoms of waterborne diseases",
        "Practice good hygiene to prevent infection",
        "Seek mental health support if traumatized"
      ]
    }
  ];

  const preventionMeasures = [
    {
      icon: "🏗️",
      title: "Community Level",
      measures: [
        "Build and maintain proper drainage systems",
        "Construct flood barriers and embankments",
        "Preserve natural floodplains and wetlands",
        "Implement early warning systems",
        "Create community disaster response teams"
      ]
    },
    {
      icon: "🏛️",
      title: "Government Level",
      measures: [
        "Enforce building codes in flood-prone areas",
        "Develop comprehensive flood management plans",
        "Invest in modern forecasting technology",
        "Build dams and reservoirs strategically",
        "Conduct regular disaster preparedness drills"
      ]
    },
    {
      icon: "🌱",
      title: "Environmental",
      measures: [
        "Massive tree plantation programs",
        "Restore natural water retention areas",
        "Prevent illegal construction on waterways",
        "Promote sustainable agriculture practices",
        "Combat climate change through green policies"
      ]
    },
    {
      icon: "👥",
      title: "Individual Level",
      measures: [
        "Don't litter - keep drainage channels clear",
        "Support environmental conservation efforts",
        "Stay educated about flood risks",
        "Participate in community preparedness programs",
        "Advocate for better flood management policies"
      ]
    }
  ];

  const getCurrentContent = () => {
    switch(selectedTab) {
      case 'before': return beforeFlood;
      case 'during': return duringFlood;
      case 'after': return afterFlood;
      case 'prevention': return preventionMeasures;
      default: return beforeFlood;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      {/* Hero Section with Image/Video Background */}
      <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            /*backgroundImage: "url('/assets/flood-prevention-bg.jpg')",*/
            backgroundColor: '#1e293b'
          }}
        >
          {/* Optional: Video Background */}
          {/* <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src="/assets/flood-prevention.mp4" type="video/mp4" />
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
              <span className="text-6xl md:text-7xl">🛡️</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent mb-4">
              Flood Prevention & Safety
            </h1>
            <p className="text-slate-300 text-lg md:text-xl max-w-3xl">
              Essential guidelines to stay safe before, during, and after floods
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 space-y-8">

        {/* Emergency Numbers Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl p-6"
        >
          <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
            <span>🚨</span> Emergency Contact Numbers
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <p className="text-slate-400 text-sm mb-1">National Emergency</p>
              <p className="text-2xl font-bold text-cyan-400">115</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <p className="text-slate-400 text-sm mb-1">Rescue 1122</p>
              <p className="text-2xl font-bold text-cyan-400">1122</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <p className="text-slate-400 text-sm mb-1">NDMA Helpline</p>
              <p className="text-2xl font-bold text-cyan-400">051-9205598</p>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap gap-3"
        >
          {[
            { id: 'before', label: 'Before Flood', icon: '📋' },
            { id: 'during', label: 'During Flood', icon: '🚨' },
            { id: 'after', label: 'After Flood', icon: '🔄' },
            { id: 'prevention', label: 'Long-term Prevention', icon: '🛡️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 ${
                selectedTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg scale-105'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{tab.icon}</span>
                {tab.label}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Content Grid */}
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {getCurrentContent().map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{item.icon}</span>
                <h3 className="text-2xl font-bold text-slate-100">{item.title}</h3>
              </div>
              
              <ul className="space-y-3">
                {(item.actions || item.measures).map((action, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <span className="text-cyan-400 mt-1 flex-shrink-0">✓</span>
                    <span className="text-sm leading-relaxed">{action}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Important Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-8"
        >
          <h2 className="text-3xl font-bold text-amber-300 mb-6 flex items-center gap-3">
            <span>💡</span> Critical Safety Tips
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-xl font-semibold text-slate-100 mb-3">DO:</h4>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Evacuate immediately when ordered</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Move to higher ground at first sign of flooding</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Keep emergency supplies easily accessible</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Help elderly, children, and disabled neighbors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Follow official instructions and updates</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-xl font-semibold text-slate-100 mb-3">DON'T:</h4>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✗</span>
                  <span>Never walk or drive through floodwater</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✗</span>
                  <span>Don't touch electrical equipment if wet</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✗</span>
                  <span>Avoid drinking untreated flood water</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✗</span>
                  <span>Don't return home until declared safe</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✗</span>
                  <span>Never ignore evacuation warnings</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Remember Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-gradient-to-r from-cyan-600 to-emerald-600 rounded-xl p-8 text-center"
        >
          <h3 className="text-3xl font-bold text-white mb-4">
            Remember: Your Safety Comes First
          </h3>
          <p className="text-cyan-50 text-lg mb-6 max-w-3xl mx-auto">
            Material possessions can be replaced, but lives cannot. Always prioritize safety over property. Stay informed, stay prepared, and stay safe.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg">
              <p className="text-white font-semibold">6 inches of water can knock you down</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg">
              <p className="text-white font-semibold">12 inches can carry away a car</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg">
              <p className="text-white font-semibold">Turn Around, Don't Drown</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

export default FloodPrevention;