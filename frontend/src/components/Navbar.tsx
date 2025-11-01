// Navbar.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        <Link to="/" className="text-2xl font-bold tracking-wide">MyWebsite</Link>

        <div className="flex items-center space-x-8">
          <Link to="/service" className="hover:text-gray-200 transition">Service</Link>
          <Link to="/about" className="hover:text-gray-200 transition">About</Link>
          <Link to="/appointments" className="hover:text-gray-200 transition">Customer Appointment</Link>

          <button
            type="button"
            onClick={() => navigate("/login")}   
            className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold shadow hover:bg-gray-100 transition"
          >
            Log In
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;