import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import MainNav from "../components/navigation/MainNav";
import { Database, TrendingUp, Lightbulb, CheckCircle, Activity, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuantHome() {
  const navigate = useNavigate();

  const layers = [
    { 
      name: "Data Layer", 
      icon: Database, 
      color: "#3b82f6", 
      page: "DataLayer",
      description: "Access market data, order flow, and real-time price feeds",
      tools: ["DOM Footprint", "Delta / Volume Logic", "Candlestick Chart"]
    },
    { 
      name: "Analysis Layer", 
      icon: TrendingUp, 
      color: "#8b5cf6", 
      page: "AnalysisLayer",
      description: "Volatility charting, combinatorics, and deep statistical data analysis.",
      tools: ["Volatility Charting", "Combinatorics", "Data Analysis"]
    },
    { 
      name: "Insight Layer", 
      icon: Lightbulb, 
      color: "#f59e0b", 
      page: "InsightLayer",
      description: "Transform analysis into actionable trading strategies",
      tools: ["Edge Reports", "Signal Detection", "Strategy Generation"]
    },
    { 
      name: "Validation Layer", 
      icon: CheckCircle, 
      color: "#10b981", 
      page: "ValidationLayer",
      description: "Backtest and validate strategies before deployment",
      tools: ["Historical Backtests", "Expectancy Analysis", "Performance Metrics"]
    }
  ];

  return (
    <div className="min-h-screen bg-black pl-16">
      <MainNav />
      
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute top-40 right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Activity className="w-8 h-8 text-white" />
              <h1 className="text-5xl font-bold text-white tracking-wide">Datrena</h1>
            </div>
            <p className="text-sm text-gray-400 max-w-3xl mx-auto">
              Professional-grade quantitative trading platform organized into four integrated layers
            </p>
          </div>

          {/* Layers Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {layers.map((layer) => {
              const Icon = layer.icon;
              return (
                <div
                  key={layer.page}
                  className="group relative bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-gray-600 transition-all duration-300 cursor-pointer"
                  style={{ borderColor: layer.color + '30' }}
                  onClick={() => navigate(createPageUrl(layer.page))}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity rounded-2xl bg-white" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-gray-300" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-3">{layer.name}</h3>
                    <p className="text-gray-400 mb-4">{layer.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {layer.tools.map((tool, i) => (
                        <span key={i} className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">{tool}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Start */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl px-8 py-4">
              <span className="text-gray-300 text-sm">Ready to start?</span>
              <Button 
                className="bg-white hover:bg-gray-200 text-black font-semibold rounded-full text-sm px-5"
                onClick={() => navigate(createPageUrl("AnalysisLayer"))}
              >
                Launch Analysis
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}