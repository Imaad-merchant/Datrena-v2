import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import MainNav from "../components/navigation/MainNav";
import { TrendingUp, TestTube, Sigma, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnalysisLayer() {
  const navigate = useNavigate();

  const tools = [
    { name: "Statistical Tests", icon: TestTube, page: "StatisticalTests", description: "Hypothesis testing and statistical significance" },
    { name: "Probability Distributions", icon: Sigma, page: "Distributions", description: "Return distributions and risk modeling" },
    { name: "Regime Detection", icon: TrendingUp, page: "RegimeDetection", description: "Market regime identification and transitions" },
    { name: "AI Pattern Discovery", icon: Target, page: "AIPatterns", description: "Machine learning pattern recognition" }
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <MainNav />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Analysis Layer</h1>
          <p className="text-xl text-gray-400">Statistical analysis, probability modeling, and pattern discovery</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.page}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition-all cursor-pointer group"
                onClick={() => navigate(createPageUrl(tool.page))}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                    <Icon className="w-6 h-6 text-purple-400" />
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