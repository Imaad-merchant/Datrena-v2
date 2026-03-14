import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Activity, Database, TrendingUp, Lightbulb, CheckCircle, BarChart3, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const navSections = [
  {
    label: "Data Layer",
    icon: Database,
    color: "#3b82f6",
    items: [
      { name: "OHLCV Charts", page: "Terminal" },
      { name: "Footprint Chart", page: "FootprintChart" },
      { name: "Order Flow", page: "OrderFlow" },
      { name: "MBO Data", page: "MBOData" }
    ]
  },
  {
    label: "Analysis Layer",
    icon: TrendingUp,
    color: "#8b5cf6",
    items: [
      { name: "Statistical Tests", page: "StatisticalTests" },
      { name: "Probability Distributions", page: "Distributions" },
      { name: "Regime Detection", page: "RegimeDetection" },
      { name: "AI Pattern Discovery", page: "AIPatterns" }
    ]
  },
  {
    label: "Insight Layer",
    icon: Lightbulb,
    color: "#f59e0b",
    items: [
      { name: "Edge Reports", page: "EdgeReports" },
      { name: "Signal Detection", page: "SignalDetection" },
      { name: "Strategy Ideas", page: "StrategyIdeas" }
    ]
  },
  {
    label: "Validation Layer",
    icon: CheckCircle,
    color: "#10b981",
    items: [
      { name: "Backtests", page: "Backtests" },
      { name: "Expectancy Analysis", page: "ExpectancyAnalysis" }
    ]
  }
];

export default function MainNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="border-b border-gray-800 bg-gray-900/95 backdrop-blur px-6 py-3 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Activity className="w-6 h-6 text-yellow-400" />
        <h1 className="text-xl font-bold tracking-wide text-white">Quantitative Analyzer</h1>
      </div>

      <div className="flex items-center gap-2 ml-4">
        {navSections.map((section) => {
          const Icon = section.icon;
          const currentPage = location.pathname.split('/').pop();
          const isActive = section.items.some(item => item.page === currentPage);

          return (
            <DropdownMenu key={section.label}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`gap-2 text-sm ${isActive ? 'bg-gray-800 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
                >
                  <Icon className="w-4 h-4" style={{ color: section.color }} />
                  {section.label}
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700">
                <DropdownMenuLabel className="text-gray-400 text-xs">{section.label}</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                {section.items.map((item) => (
                  <DropdownMenuItem
                    key={item.page}
                    onClick={() => navigate(createPageUrl(item.page))}
                    className={`cursor-pointer ${currentPage === item.page ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                  >
                    {item.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })}
      </div>
    </div>
  );
}