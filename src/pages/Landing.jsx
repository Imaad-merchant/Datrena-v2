import React, { useState } from "react";
import TradersSection from "../components/landing/TradersSection";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Activity } from "lucide-react";

export default function Landing() {
  const handleSignIn = () => {
    base44.auth.redirectToLogin("/QuantHome");
  };

  return (
    <div className="min-h-screen bg-black flex flex-col text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-5 z-10 relative">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-white" />
          <span className="text-white text-lg font-bold tracking-wide">Datrena</span>
        </div>
        <div className="flex items-center gap-10">
          <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">Pricing</a>
          <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">Features</a>
          <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">Forge Labs</a>
          <button
            onClick={handleSignIn}
            className="text-white text-sm font-semibold hover:text-gray-300 transition-colors ml-4"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex items-start justify-between px-10 pt-10 pb-16">
        {/* Left */}
        <div className="max-w-md mt-4">
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
            Quantitative Research<br />Meets Analytics
          </h1>
          <p className="text-gray-400 text-sm mb-3">
            A Professional Software Offering Distinctions that redefine with Meaning
          </p>
          <ul className="text-gray-400 text-sm space-y-1 mb-8">
            <li>- Order Flow Analysis</li>
            <li>- Advanced Backtesting</li>
            <li>- Statistical Distributions</li>
            <li>- Prop Firm Rating</li>
          </ul>
          <button
            onClick={handleSignIn}
            className="bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-gray-200 transition-colors text-sm flex items-center gap-2"
          >
            Start for Free →
          </button>
        </div>

        {/* Right — terminal screenshot */}
        <div className="flex-shrink-0 mt-2">
          <img
            src="https://media.base44.com/images/public/69a877fa3c3927b616239696/ea49b83e1_Screenshot2026-03-19at55922PM.png"
            alt="Datrena Terminal"
            className="rounded-xl shadow-2xl"
            style={{ width: 520 }}
          />
        </div>
      </div>

      {/* Layers section */}
      <div className="px-10 pb-16">
        <p className="text-center text-gray-300 text-base mb-8">
          Analyze securities with advanced <strong>Datrena</strong> <em>tools</em>
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
          {/* Data Layer */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-gray-600 transition-colors cursor-pointer" onClick={handleSignIn}>
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <span className="text-gray-300 text-lg">📊</span>
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">Data Layer</h3>
            <p className="text-gray-400 text-sm mb-4">Stream historical and live tick data and test live order flow metrics.</p>
            <div className="flex flex-wrap gap-2">
              {["Candlestick", "Footprint", "Cumulative Delta"].map(tag => (
                <span key={tag} className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">{tag}</span>
              ))}
            </div>
          </div>

          {/* Analysis Layer */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-gray-600 transition-colors cursor-pointer" onClick={handleSignIn}>
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <span className="text-gray-300 text-lg">🧠</span>
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">Analysis Layer</h3>
            <p className="text-gray-400 text-sm mb-4">Run advanced quant models and AI-driven statistical research.</p>
            <div className="flex flex-wrap gap-2">
              {["Volatility Charting", "Combinatorics", "Data Analysis"].map(tag => (
                <span key={tag} className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">{tag}</span>
              ))}
            </div>
          </div>

          {/* Insight Layer */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-gray-600 transition-colors cursor-pointer" onClick={handleSignIn}>
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <span className="text-gray-300 text-lg">💡</span>
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">Insight Layer</h3>
            <p className="text-gray-400 text-sm mb-4">Track prop firm performance and visualize trade history analytics.</p>
            <div className="flex flex-wrap gap-2">
              {["P&L Tracking", "Win Rate", "Drawdown", "Calendar"].map(tag => (
                <span key={tag} className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">{tag}</span>
              ))}
            </div>
          </div>

          {/* Validation Layer */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-gray-600 transition-colors cursor-pointer" onClick={handleSignIn}>
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <span className="text-gray-300 text-lg">✅</span>
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">Validation Layer</h3>
            <p className="text-gray-400 text-sm mb-4">Backtest and validate strategies with walk-forward analysis.</p>
            <div className="flex flex-wrap gap-2">
              {["Backtesting", "Walk-Forward", "Monte Carlo", "Risk Metrics"].map(tag => (
                <span key={tag} className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Traders section */}
      <TradersSection onSignIn={handleSignIn} />
    </div>
  );
}