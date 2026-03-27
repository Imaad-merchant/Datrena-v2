import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import MainNav from "../components/navigation/MainNav";
import { CheckCircle, PlayCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ValidationLayer() {
  const navigate = useNavigate();

  const tools = [
    { name: "Backtests", icon: PlayCircle, page: "Backtests", description: "Historical strategy performance testing" },
    { name: "Expectancy Analysis", icon: TrendingUp, page: "ExpectancyAnalysis", description: "Win rate, profit factor, and edge validation" }
  ];

  return (
    <div className="min-h-screen bg-black pl-16">
      <MainNav />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Validation Layer</h1>
          <p className="text-xl text-gray-400">Backtest strategies and validate trading edge before deployment</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.page}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition-all cursor-pointer group"
                onClick={() => navigate(createPageUrl(tool.page))}
              >
                <div className="flex items-start gap-4">
                 <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                   <Icon className="w-5 h-5 text-gray-300" />
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