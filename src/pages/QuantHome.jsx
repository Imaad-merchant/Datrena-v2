import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import MainNav from "../components/navigation/MainNav";
import { Database, TrendingUp, Lightbulb, CheckCircle, Plus, FolderOpen, ArrowRight } from "lucide-react";

const LAYERS = [
  { name: "Data Layer", icon: Database, page: "DataLayer", description: "Real-time order flow, footprint charts, and market data feeds" },
  { name: "Analysis Layer", icon: TrendingUp, page: "AnalysisLayer", description: "Volatility charting, combinatorics, and AI-driven statistical analysis" },
  { name: "Insight Layer", icon: Lightbulb, page: "InsightLayer", description: "Trade performance tracking and prop firm integration" },
  { name: "Validation Layer", icon: CheckCircle, page: "ValidationLayer", description: "Backtest strategies and validate trading edge" },
];

export default function QuantHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black pl-16 text-white">
      <MainNav />

      <div className="max-w-6xl mx-auto px-8 py-10 grid grid-cols-3 gap-8">

        {/* Left Column */}
        <div className="col-span-1 space-y-8">
          {/* Start */}
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Start</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate(createPageUrl("AnalysisLayer"))}
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Analysis
              </button>
              <button
                onClick={() => navigate(createPageUrl("DataLayer"))}
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <FolderOpen className="w-4 h-4" />
                Open Data Layer
              </button>
            </div>
          </div>

          {/* Layers */}
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Platform Layers</h2>
            <div className="space-y-2">
              {LAYERS.map((layer) => {
                const Icon = layer.icon;
                return (
                  <button
                    key={layer.page}
                    onClick={() => navigate(createPageUrl(layer.page))}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-600 transition-all text-left group"
                  >
                    <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{layer.name}</span>
                    <ArrowRight className="w-3 h-3 text-gray-700 group-hover:text-gray-400 ml-auto transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Layer Cards */}
        <div className="col-span-2">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 gap-4">
            {LAYERS.map((layer) => {
              const Icon = layer.icon;
              return (
                <div
                  key={layer.page}
                  onClick={() => navigate(createPageUrl(layer.page))}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                      <Icon className="w-4 h-4 text-gray-300" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">{layer.name}</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{layer.description}</p>
                  <div className="mt-3 flex items-center gap-1 text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Open <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}