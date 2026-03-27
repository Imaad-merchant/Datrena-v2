import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import MainNav from "../components/navigation/MainNav";
import { Plus, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PROP_FIRMS = [
  "TopStep", "Tradovate", "Apex", "Alpha Futures", "FTMO", 
  "Earn2Trade", "The5ers", "Bulenox", "My Forex Funds"
];

export default function InsightLayer() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFirm, setSelectedFirm] = useState("");
  const [accountId, setAccountId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const queryClient = useQueryClient();

  const { data: connections = [] } = useQuery({
    queryKey: ['propConnections'],
    queryFn: () => base44.entities.PropFirmConnection.list()
  });

  const { data: trades = [] } = useQuery({
    queryKey: ['trades'],
    queryFn: () => base44.entities.Trade.list()
  });

  const createConnection = useMutation({
    mutationFn: (data) => base44.entities.PropFirmConnection.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['propConnections']);
      setDialogOpen(false);
      setSelectedFirm("");
      setAccountId("");
      setApiKey("");
    }
  });

  const handleConnect = () => {
    if (!selectedFirm || !accountId || !apiKey) return;
    createConnection.mutate({
      firm_name: selectedFirm,
      account_id: accountId,
      api_key: apiKey,
      status: "connected",
      last_sync: new Date().toISOString()
    });
  };

  const winningTrades = trades.filter(t => t.pnl > 0);
  const losingTrades = trades.filter(t => t.pnl < 0);
  const totalTrades = trades.length;
  const winCount = winningTrades.length;
  const lossCount = losingTrades.length;

  const totalWins = winningTrades.reduce((s, t) => s + t.pnl, 0);
  const avgWin = winCount > 0 ? totalWins / winCount : 0;
  const avgLoss = lossCount > 0 ? Math.abs(losingTrades.reduce((s, t) => s + t.pnl, 0) / lossCount) : 0;
  const largestWin = winCount > 0 ? Math.max(...winningTrades.map(t => t.pnl)) : 0;
  const largestLoss = lossCount > 0 ? Math.abs(Math.min(...losingTrades.map(t => t.pnl))) : 0;
  const avgWinStreak = 0;
  const avgLossStreak = 0;
  const maxWinStreak = 0;
  const maxLossStreak = 0;

  const winPercentage = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
  const lossPercentage = totalTrades > 0 ? (lossCount / totalTrades) * 100 : 0;

  // Get current month/year
  const now = new Date();
  const currentMonth = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  // Calendar heatmap data - empty when no trades
  const getDaysInMonth = () => {
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const weeks = [];
    let week = new Array(firstDay).fill(null);
    
    for (let day = 1; day <= daysInMonth; day++) {
      week.push({ day, value: 0, trades: 0 });
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }
    return weeks;
  };
  
  const calendarData = getDaysInMonth();

  return (
    <div className="min-h-screen bg-black pl-16">
      <MainNav />
      
      <div className="flex-1">
        <div className="border-b border-gray-800 bg-[#0f0f0f] px-6 py-3 flex items-center justify-between">
          <h1 className="text-white text-lg font-semibold">Trades Summary</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" className="text-gray-400 hover:bg-gray-800">
                <Plus className="w-4 h-4 mr-1" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-white">Connect Prop Firm</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-gray-300">Prop Firm</Label>
                  <Select value={selectedFirm} onValueChange={setSelectedFirm}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select firm" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {PROP_FIRMS.map(firm => (
                        <SelectItem key={firm} value={firm} className="text-white">
                          {firm}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-300">Account ID</Label>
                  <Input
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Enter account ID"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">API Key</Label>
                  <Input
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Enter API key"
                    type="password"
                  />
                </div>
                <Button 
                  onClick={handleConnect}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!selectedFirm || !accountId || !apiKey}
                >
                  Connect
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="p-6">
          {/* Performance Section */}
          <div className="bg-[#111111] border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-white text-base font-semibold mb-6">Trade Performance</h2>
            
            <div className="grid grid-cols-2 gap-8">
              {/* Gauge Chart */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  <svg width="280" height="160" viewBox="0 0 280 160">
                    {/* Background arc */}
                    <path
                      d="M 40 140 A 100 100 0 0 1 240 140"
                      fill="none"
                      stroke="#1a1a1a"
                      strokeWidth="32"
                      strokeLinecap="round"
                    />
                    {/* Loss arc (red) */}
                    <path
                      d="M 40 140 A 100 100 0 0 1 140 40"
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="32"
                      strokeLinecap="round"
                    />
                    {/* Win arc (green) */}
                    <path
                      d="M 140 40 A 100 100 0 0 1 240 140"
                      fill="none"
                      stroke="#16a34a"
                      strokeWidth="32"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/4 text-center">
                    <div className="text-5xl font-bold text-white">{totalTrades}</div>
                    <div className="text-sm text-gray-500">Trades</div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Wins Column */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-white font-semibold">Wins</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Wins</span>
                      <span className="text-white font-semibold">{totalTrades > 0 ? winCount : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Win $</span>
                      <span className="text-green-400 font-semibold">{totalTrades > 0 ? `$${totalWins.toFixed(2)}` : '$0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Average Win</span>
                      <span className="text-green-400 font-semibold">{totalTrades > 0 ? `$${avgWin.toFixed(2)}` : '$0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Average Win Duration</span>
                      <span className="text-white font-semibold">N/A</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Average Win in a row</span>
                      <span className="text-white font-semibold">N/A</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max Win in a row</span>
                      <span className="text-white font-semibold">N/A</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max Win | Equate</span>
                      <span className="text-white font-semibold">{totalTrades > 0 ? `$${largestWin.toFixed(2)}` : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Losses Column */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-white font-semibold">Losses</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Losses</span>
                      <span className="text-white font-semibold">{totalTrades > 0 ? lossCount : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Loss</span>
                      <span className="text-red-400 font-semibold">$0.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Average Loss</span>
                      <span className="text-red-400 font-semibold">{totalTrades > 0 ? `$${avgLoss.toFixed(2)}` : '$0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg loss Duration</span>
                      <span className="text-white font-semibold">N/A</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg loss in a row</span>
                      <span className="text-white font-semibold">N/A</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max loss in a row</span>
                      <span className="text-white font-semibold">N/A</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max Loss | Streak</span>
                      <span className="text-white font-semibold">{totalTrades > 0 ? `$${largestLoss.toFixed(2)}` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Section */}
          <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button className="text-gray-500 hover:text-white">←</button>
                <h3 className="text-white font-semibold">{currentMonth}</h3>
                <button className="text-gray-500 hover:text-white">→</button>
              </div>
              <button className="text-gray-500 hover:text-white">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              {[
                { label: "Total Trades", value: totalTrades > 0 ? totalTrades : "N/A" },
                { label: "P&L", value: totalTrades > 0 ? `$${(totalWins - Math.abs(losingTrades.reduce((s, t) => s + t.pnl, 0))).toFixed(2)}` : "N/A" },
                { label: "Win%", value: totalTrades > 0 ? `${winPercentage.toFixed(0)}%` : "N/A" },
                { label: "Total Sales", value: "N/A" },
                { label: "Losing Days", value: totalTrades > 0 ? lossCount : "N/A" },
                { label: "Winning Days", value: totalTrades > 0 ? winCount : "N/A" }
              ].map((stat, i) => (
                <div key={i} className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    {stat.label}
                    <Maximize2 className="w-3 h-3" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Day Labels */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day, i) => (
                <div key={i} className="text-center text-xs text-gray-500">{day}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="space-y-2">
              {calendarData.map((week, weekIdx) => (
                <div key={weekIdx} className="grid grid-cols-7 gap-2">
                  {week.map((day, dayIdx) => (
                    <div
                      key={dayIdx}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs ${
                        day === null
                          ? "bg-transparent"
                          : day.value > 0
                          ? "bg-green-600 text-white"
                          : day.value < 0
                          ? "bg-red-600 text-white"
                          : "bg-[#1a1a1a] text-gray-600"
                      }`}
                    >
                      {day && day.value !== 0 && (
                        <>
                          <div className="font-bold">${Math.abs(day.value).toFixed(0)}</div>
                          <div className="text-[10px]">{day.trades} trades</div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}