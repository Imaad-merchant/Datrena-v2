import React from "react";
import { TrendingUp, TrendingDown, Target, DollarSign, Percent, BarChart3 } from "lucide-react";

export default function PerformanceStats({ trades }) {
  const winningTrades = (trades || []).filter(t => t.pnl > 0);
  const losingTrades = (trades || []).filter(t => t.pnl < 0);
  
  const totalTrades = (trades || []).length;
  const winRate = totalTrades > 0 ? ((winningTrades.length / totalTrades) * 100).toFixed(1) : "0.0";
  
  const totalPnL = (trades || []).reduce((sum, t) => sum + t.pnl, 0);
  const avgWin = winningTrades.length > 0 
    ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length 
    : 0;
  const avgLoss = losingTrades.length > 0 
    ? losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length 
    : 0;
  
  const largestWin = winningTrades.length > 0 
    ? Math.max(...winningTrades.map(t => t.pnl)) 
    : 0;
  const largestLoss = losingTrades.length > 0 
    ? Math.min(...losingTrades.map(t => t.pnl)) 
    : 0;
  
  const riskRewardRatio = avgLoss !== 0 ? (avgWin / Math.abs(avgLoss)).toFixed(2) : "N/A";

  const stats = [
    {
      label: "Total Trades",
      value: totalTrades,
      icon: BarChart3,
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      label: "Win Rate",
      value: `${winRate}%`,
      icon: Target,
      color: "text-green-400",
      bg: "bg-green-500/10"
    },
    {
      label: "Total P&L",
      value: `$${totalPnL.toFixed(2)}`,
      icon: DollarSign,
      color: totalPnL >= 0 ? "text-green-400" : "text-red-400",
      bg: totalPnL >= 0 ? "bg-green-500/10" : "bg-red-500/10"
    },
    {
      label: "Risk/Reward",
      value: riskRewardRatio,
      icon: Percent,
      color: "text-purple-400",
      bg: "bg-purple-500/10"
    },
    {
      label: "Avg Win",
      value: `$${avgWin.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-500/10"
    },
    {
      label: "Avg Loss",
      value: `$${avgLoss.toFixed(2)}`,
      icon: TrendingDown,
      color: "text-red-400",
      bg: "bg-red-500/10"
    },
    {
      label: "Largest Win",
      value: `$${largestWin.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-500/10"
    },
    {
      label: "Largest Loss",
      value: `$${largestLoss.toFixed(2)}`,
      icon: TrendingDown,
      color: "text-red-400",
      bg: "bg-red-500/10"
    }
  ];

  return (
    <div className="grid md:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
}