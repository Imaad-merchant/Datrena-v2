import React from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Activity, FlaskConical } from "lucide-react";

export default function ForgeLabs() {
  return (
    <div className="bg-black min-h-screen text-white">
      <nav className="flex items-center justify-between px-10 py-5 z-10 relative">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-white" />
          <Link to="/" className="text-white text-lg font-bold tracking-wide hover:text-gray-300 transition-colors">Datrena</Link>
        </div>
        <div className="flex items-center gap-10">
          <Link to="/Pricing" className="text-gray-300 hover:text-white text-sm transition-colors">Pricing</Link>
          <Link to="/Features" className="text-gray-300 hover:text-white text-sm transition-colors">Features</Link>
          <Link to="/ForgeLabs" className="text-white text-sm transition-colors">Forge Labs</Link>
          <button
            onClick={() => base44.auth.redirectToLogin("/QuantHome")}
            className="text-white text-sm font-semibold hover:text-gray-300 transition-colors ml-4"
          >
            Sign In
          </button>
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-10">
        <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-6 border border-gray-800">
          <FlaskConical className="w-8 h-8 text-gray-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Forge Labs</h1>
        <p className="text-gray-500 text-sm max-w-sm">
          Something experimental is brewing here. We're still developing this space — stay tuned for what's coming.
        </p>
      </div>
    </div>
  );
}