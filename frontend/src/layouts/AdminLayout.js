import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0b1326] text-white flex flex-col">
      <Navbar />
      <main className="flex-grow p-6">{children}</main>
      <Footer />
    </div>
  );
}

export default AdminLayout;
