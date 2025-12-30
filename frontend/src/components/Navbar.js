import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

export const colors = {
  primary: '#06b6d4',
  primaryDark: '#0891b2',
  primaryLight: '#67e8f9',
  accent: '#10b981',
  accentDark: '#059669',
  danger: '#ef4444',
  warning: '#f59e0b',
  bgDark: '#0f172a',
  bgMedium: '#1e293b',
  bgLight: '#334155',
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
};

function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resourcesDropdownOpen, setResourcesDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownTimeoutRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user:", error);
        setUser(null);
      }
    }
  }, [window.location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const getDashboardRoute = () => {
    if (!user) return "/dashboard";

    // Admin flag from backend
    if (user.isAdmin) return "/admin";

    // Role-based routing
    const role = (user.role || "").toLowerCase();

    if (role === "citizen") return "/citizen";
    if (role === "rescue") return "/rescue";

    return "/dashboard";
  };

  const getDashboardIcon = () => {
    if (!user || !user.role) return "📊";
    const role = user.role.toLowerCase();
    if (role === "citizen") return "👤";
    if (role === "rescue") return "🚁";
    if (role === "admin") return "⚙️";
    return "📊";
  };

  const resourceLinks = [
    { to: "/FloodHistory", label: "Flood History", icon: "📜" },
    { to: "/FloodCauses", label: "Causes", icon: "🔍" },
    { to: "/FloodPrevention", label: "Prevention & Safety", icon: "🛡️" },
  ];

  // Handle dropdown with delay
  const handleDropdownEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setResourcesDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setResourcesDropdownOpen(false);
    }, 200); // 200ms delay before closing
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  return (
    <nav className="w-full px-6 py-4 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <img 
              src="\assets\logo.jpeg" 
              className="w-10 h-10 rounded-full ring-2 ring-cyan-500/30 group-hover:ring-cyan-500/60 transition-all duration-300" 
              alt="Minarah logo" 
            />
            <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-md group-hover:blur-lg transition-all duration-300" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 group-hover:text-cyan-400 transition-colors duration-300">
            Minarah
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {!user ? (
            <>
              <Link className="text-slate-300 hover:text-cyan-400 transition-colors duration-200 font-medium" to="/">
                Home
              </Link>

              <Link className="text-slate-300 hover:text-cyan-400 transition-colors duration-200 font-medium" to="/about">
                About Us
              </Link>

              {/* Resources Dropdown */}
              <div 
                className="relative"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  className="text-slate-300 hover:text-cyan-400 transition-colors duration-200 font-medium flex items-center gap-1"
                >
                  Resources
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${resourcesDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {resourcesDropdownOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                    onMouseEnter={handleDropdownEnter}
                    onMouseLeave={handleDropdownLeave}
                  >
                    {resourceLinks.map(link => (
                      <Link 
                        key={link.to} 
                        to={link.to}
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-700 transition-all duration-200"
                      >
                        <span className="text-xl">{link.icon}</span>
                        <span className="font-medium">{link.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Link 
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300"
                  to="/signup"
                >
                  Signup
                </Link>

                <Link 
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300" 
                  to="/login"
                >
                  Login
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Logged in view */}
              <Link to="/" className="text-slate-300 hover:text-cyan-400 transition-colors font-medium">
                Home
              </Link>

              <Link to="/about" className="text-slate-300 hover:text-cyan-400 transition-colors font-medium">
                About Us
              </Link>

              {/* Resources Dropdown */}
              <div 
                className="relative"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  className="text-slate-300 hover:text-cyan-400 transition-colors duration-200 font-medium flex items-center gap-1"
                >
                  Resources
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${resourcesDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {resourcesDropdownOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                    onMouseEnter={handleDropdownEnter}
                    onMouseLeave={handleDropdownLeave}
                  >
                    {resourceLinks.map(link => (
                      <Link 
                        key={link.to} 
                        to={link.to}
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-700 transition-all duration-200"
                      >
                        <span className="text-xl">{link.icon}</span>
                        <span className="font-medium">{link.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Link 
                  to={getDashboardRoute()} 
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition-all"
                >
                  <span>{getDashboardIcon()}</span> Dashboard
                </Link>

                {/* User*/}
                {user.name && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all font-medium"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button onClick={toggleMobileMenu} className="md:hidden flex flex-col gap-1.5 p-2 hover:bg-slate-800 rounded-lg transition-colors">
          <span className={`w-6 h-0.5 bg-slate-300 transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`w-6 h-0.5 bg-slate-300 transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
          <span className={`w-6 h-0.5 bg-slate-300 transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>
    </nav>
  );
}

export default Navbar;