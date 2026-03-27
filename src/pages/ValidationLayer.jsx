import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import MainNav from "../components/navigation/MainNav";
import { PlayCircle, TrendingUp, Plus, FolderOpen, ArrowRight, CheckCircle } from "lucide-react";

const TOOLS = [
  { name: "Backtests", icon: PlayCircle, page: "Backtests", description: "Run historical strategy simulations and view equity curves" },
  { name: "Expectancy Analysis", icon: TrendingUp, page: "ExpectancyAnalysis", description: "Win rate, profit factor, and statistical edge validation" },
];

const QUICK_LINKS = [
  { label: "New Backtest", icon: Plus, page: "Backtests" },
  { label: "Open Expectancy Report", icon: FolderOpen, page: "ExpectancyAnalysis" },
];

export default function ValidationLayer() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black pl-16 text-white">
      <MainNav />

      <div className="max-w-6xl mx-auto px-8 py-10 grid grid-cols-3 gap-8">

        {/* Left Column */}
        <div className="col-span-1 space-y-8">
          {/* Start */}
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Start</h2>
            <div className="space-y-3">
              {QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.page}
                    onClick={() => navigate(createPageUrl(link.page))}
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tools */}
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Tools</h2>
            <div className="space-y-2">
              {TOOLS.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.page}
                    onClick={() => navigate(createPageUrl(tool.page))}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-600 transition-all text-left group"
                  >
                    <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{tool.name}</span>
                    <ArrowRight className="w-3 h-3 text-gray-700 group-hover:text-gray-400 ml-auto transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Tool Cards */}
        <div className="col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Validation Layer</h1>
          </div>
          <p className="text-sm text-gray-400 mb-6">Backtest strategies and validate your trading edge before deployment.</p>

          <div className="grid grid-cols-2 gap-4">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.page}
                  onClick={() => navigate(createPageUrl(tool.page))}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                      <Icon className="w-4 h-4 text-gray-300" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">{tool.name}</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{tool.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
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