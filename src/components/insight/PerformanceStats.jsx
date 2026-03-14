import React from "react";

export default function PerformanceStats({ trades }) {
  const winningTrades = (trades || []).filter(t => t.pnl > 0);
  const losingTrades = (trades || []).filter(t => t.pnl < 0);
  
  const totalTrades = (trades || []).length;
  const winRate = totalTrades > 0 ? ((winningTrades.length / totalTrades) * 100).toFixed(1) : 0;
  
  const totalPnL = (trades || []).reduce((sum, t) => sum + t.pnl, 0);
  const avgWin = winningTrades.length > 0 
    ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length 
    : 0;
  const avgLoss = losingTrades.length > 0 
    ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length)
    : 0;
  
  const largestWin = winningTrades.length > 0 
    ? Math.max(...winningTrades.map(t => t.pnl)) 
    : 0;
  const largestLoss = losingTrades.length > 0 
    ? Math.abs(Math.min(...losingTrades.map(t => t.pnl)))
    : 0;
  
  const riskRewardRatio = avgLoss !== 0 ? (avgWin / avgLoss).toFixed(2) : 0;

  const maxValue = Math.max(avgWin, avgLoss, largestWin, largestLoss, 1);

  const stats = [
    { label: "Total Trades", value: totalTrades, type: "number" },
    { label: "Win Rate", value: winRate, suffix: "%", type: "number" },
    { label: "Total P&L", value: totalPnL, prefix: "$", type: "number", color: totalPnL >= 0 ? "green" : "red" },
    { label: "Risk/Reward Ratio", value: riskRewardRatio, type: "number" },
    { label: "Avg Win", value: avgWin, prefix: "$", barWidth: (avgWin / maxValue) * 100, color: "green" },
    { label: "Avg Loss", value: avgLoss, prefix: "$", barWidth: (avgLoss / maxValue) * 100, color: "red" },
    { label: "Largest Win", value: largestWin, prefix: "$", barWidth: (largestWin / maxValue) * 100, color: "blue" },
    { label: "Largest Loss", value: largestLoss, prefix: "$", barWidth: (largestLoss / maxValue) * 100, color: "orange" }
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="space-y-4">
        {stats.map((stat, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-48 text-sm text-gray-400 font-medium">{stat.label}</div>
            
            {stat.type === "number" && (
              <div className={`text-lg font-bold ${
                stat.color === "green" ? "text-green-400" : 
                stat.color === "red" ? "text-red-400" : 
                "text-gray-200"
              }`}>
                {stat.prefix || ""}{typeof stat.value === "number" ? stat.value.toFixed(2) : stat.value}{stat.suffix || ""}
              </div>
            )}

            {stat.barWidth !== undefined && (
              <div className="flex-1 flex items-center gap-3">
                <div className="flex-1 bg-gray-800 rounded-full h-8 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      stat.color === "green" ? "bg-green-500" :
                      stat.color === "red" ? "bg-red-500" :
                      stat.color === "blue" ? "bg-blue-500" :
                      "bg-orange-500"
                    }`}
                    style={{ width: `${stat.barWidth}%` }}
                  />
                </div>
                <div className={`text-sm font-bold w-24 text-right ${
                  stat.color === "green" ? "text-green-400" :
                  stat.color === "red" ? "text-red-400" :
                  stat.color === "blue" ? "text-blue-400" :
                  "text-orange-400"
                }`}>
                  {stat.prefix || ""}{stat.value.toFixed(2)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}