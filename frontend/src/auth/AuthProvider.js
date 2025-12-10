import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("minarah_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (token, role, profile) => {
    const userData = { token, role, profile };
    localStorage.setItem("minarah_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("minarah_user");
    setUser(null);
  };

  useEffect(() => {
    const saved = localStorage.getItem("minarah_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
