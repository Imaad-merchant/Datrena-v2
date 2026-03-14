import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import MainNav from "../components/navigation/MainNav";
import { Database, BarChart3, Activity, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DataLayer() {
  const navigate = useNavigate();

  const tools = [
    { name: "OHLCV Charts", icon: BarChart3, page: "Terminal", description: "Historical price data and volatility analysis" },
    { name: "Footprint Chart", icon: Activity, page: "FootprintChart", description: "Order flow visualization and market profile" },
    { name: "Order Flow", icon: Grid, page: "OrderFlow", description: "Real-time bid/ask flow analysis" },
    { name: "MBO Data", icon: Database, page: "MBOData", description: "Market-by-order depth visualization" }
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <MainNav />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Data Layer</h1>
          <p className="text-xl text-gray-400">Access market data, order flow, and raw price information</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.page}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 transition-all cursor-pointer group"
                onClick={() => navigate(createPageUrl(tool.page))}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{tool.name}</h3>
                    <p className="text-gray-400 text-sm">{tool.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}