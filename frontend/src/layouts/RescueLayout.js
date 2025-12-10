import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function RescueLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0a1a2f] text-white flex flex-col">
      <Navbar />
      <main className="flex-grow p-6">{children}</main>
      <Footer />
    </div>
  );
}

export default RescueLayout;
