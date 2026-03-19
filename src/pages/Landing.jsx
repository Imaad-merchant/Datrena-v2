import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const navigate = useNavigate();

  const handleSignIn = () => {
    base44.auth.redirectToLogin(createPageUrl("QuantHome"));
  };

  const handleCreateAccount = () => {
    base44.auth.redirectToLogin(createPageUrl("QuantHome"));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-black text-white text-xs">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">📁 Recreation</span>
            <span className="flex items-center gap-1">📊 Market Tools</span>
            <span className="flex items-center gap-1">📈 Drivers & Models</span>
            <span className="flex items-center gap-1">📋 Subtools</span>
            <span className="flex items-center gap-1">🤖 AI Tools</span>
            <span className="flex items-center gap-1">⚙️ Apps</span>
          </div>
          <div className="flex items-center gap-4">
            <span>🔖 All Bookmark</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded-full" />
            </div>
            <span className="text-xl font-bold text-gray-900">DATRENA</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-900">Pricing</a>
            <a href="#" className="hover:text-gray-900">Research</a>
            <a href="#" className="hover:text-gray-900">Strategies</a>
            <a href="#" className="hover:text-gray-900">Data</a>
            <a href="#" className="hover:text-gray-900">Documentation</a>
            <a href="#" className="hover:text-gray-900">Algorithm Lab</a>
          </nav>

          <Button 
            onClick={handleSignIn}
            variant="ghost" 
            className="text-gray-700 hover:text-gray-900"
          >
            🔒 Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-white overflow-hidden">
        {/* Decorative dots pattern */}
        <div className="absolute top-0 left-0 w-64 h-64 opacity-30">
          <div className="grid grid-cols-8 gap-2 p-8">
            {[...Array(64)].map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-gray-300" />
            ))}
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="relative z-10">
              <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Quantitative Trading<br />Made Simple
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-md">
                Power your quantitative research with a cutting-edge, unified API for research, backtesting, and live trading on the world's leading algorithmic trading platform.
              </p>
              <Button 
                onClick={handleCreateAccount}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-base font-semibold rounded-md shadow-lg"
              >
                Create Free Account
              </Button>
            </div>

            {/* Right Content - Platform Preview */}
            <div className="relative">
              <div className="relative" style={{ transform: 'perspective(1200px) rotateY(-15deg) rotateX(5deg)' }}>
                <div className="bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
                  {/* Monitor frame */}
                  <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-600" />
                    <div className="w-3 h-3 rounded-full bg-gray-600" />
                    <div className="w-3 h-3 rounded-full bg-gray-600" />
                  </div>
                  {/* Dashboard content */}
                  <div className="p-4 bg-gray-950 h-80 relative">
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="bg-gray-800/50 rounded p-2 h-16" />
                      <div className="bg-gray-800/50 rounded p-2 h-16" />
                      <div className="bg-gray-800/50 rounded p-2 h-16" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-gray-800/50 rounded p-2 h-32" />
                      <div className="bg-gray-800/50 rounded p-2 h-32" />
                    </div>
                    <div className="bg-gray-800/50 rounded p-2 h-20" />
                  </div>
                  {/* Blue accent bar */}
                  <div className="h-1 bg-blue-500" />
                </div>
                {/* Monitor stand */}
                <div className="mx-auto w-32 h-4 bg-gradient-to-b from-gray-400 to-gray-500 rounded-t-sm" />
                <div className="mx-auto w-48 h-2 bg-gradient-to-b from-gray-500 to-gray-600 rounded-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto px-6 mt-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-gray-200">
            <div>
              <div className="text-xs text-gray-500 uppercase mb-2">Award Winning Quant Analytics Platform</div>
              <div className="text-5xl font-bold text-gray-900 mb-1">475K</div>
              <div className="text-xs text-gray-600 uppercase leading-tight">Quant<br />Community</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-gray-900 mb-1">500K+</div>
              <div className="text-xs text-gray-600 uppercase leading-tight">Backtests<br />Per Month</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-gray-900 mb-1">$45B</div>
              <div className="text-xs text-gray-600 uppercase leading-tight">Vol UMF<br />Per Month</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-gray-900 mb-1">+7%</div>
              <div className="text-xs text-gray-600 uppercase leading-tight">Returns<br />Over Market</div>
            </div>
          </div>

          {/* As Seen On */}
          <div className="mt-12 pb-20">
            <div className="text-xs text-gray-500 uppercase mb-8 text-center">As Seen On</div>
            <div className="flex items-center justify-center gap-16 flex-wrap">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <div className="w-6 h-6 bg-gray-900 rounded" />
                <span>FINANCIAL TIMES</span>
              </div>
              <div className="text-2xl font-serif font-bold text-gray-800">WSJ</div>
              <div className="flex flex-col items-center text-xs font-bold text-gray-800">
                <span>BUSINESS</span>
                <span>INSIDER</span>
              </div>
              <div className="text-2xl font-bold text-gray-800">with.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-sm text-gray-500">
            © 2026 Datrena. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}