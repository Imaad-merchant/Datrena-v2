import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Play, Loader2 } from "lucide-react";

const COMMON_TICKERS = ["NQ=F", "ES=F", "SPY", "QQQ", "AAPL", "TSLA", "MSFT", "BTC-USD", "GC=F", "CL=F"];
const TIMEFRAMES = ["1m", "2m", "5m", "15m", "30m", "1h", "4h", "1d"];

export default function TerminalSettings({ symbol, setSymbol, lookbackDays, setLookbackDays, timeframe, setTimeframe, onRun, loading }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Terminal Settings</h2>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300 text-sm">Ticker Symbol</Label>
        <Input
          value={symbol}
          onChange={e => setSymbol(e.target.value.toUpperCase())}
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-yellow-500"
          placeholder="e.g. NQ=F"
          onKeyDown={e => e.key === 'Enter' && onRun()}
        />
        <div className="flex flex-wrap gap-1 mt-2">
          {COMMON_TICKERS.map(t => (
            <button
              key={t}
              onClick={() => setSymbol(t)}
              className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                symbol === t
                  ? "bg-yellow-500 text-gray-900 border-yellow-500 font-semibold"
                  : "border-gray-700 text-gray-400 hover:border-yellow-600 hover:text-yellow-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-gray-300 text-sm">Analysis Window</Label>
          <span className="text-yellow-400 font-bold text-sm">{lookbackDays}d</span>
        </div>
        <Slider
          min={7}
          max={60}
          step={1}
          value={[lookbackDays]}
          onValueChange={([v]) => setLookbackDays(v)}
          className="[&_.relative]:bg-gray-700 [&_[role=slider]]:bg-yellow-400 [&_[role=slider]]:border-yellow-400"
        />
        <div className="flex justify-between text-xs text-gray-600">
          <span>7d</span>
          <span>60d</span>
        </div>
      </div>

      <Button
        onClick={onRun}
        disabled={loading || !symbol}
        className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
        ) : (
          <><Play className="w-4 h-4 mr-2" /> Run Analysis</>
        )}
      </Button>

      <div className="border-t border-gray-800 pt-4 space-y-2">
        <p className="text-xs text-gray-600 uppercase tracking-widest font-bold">Session Reference</p>
        <div className="space-y-1 text-xs text-gray-400">
          <div className="flex justify-between"><span className="text-blue-400">London</span><span>02:00–05:00 UTC</span></div>
          <div className="flex justify-between"><span className="text-green-400">NY Open</span><span>13:30 UTC</span></div>
          <div className="flex justify-between"><span className="text-purple-400">Asia</span><span>00:00–02:00 UTC</span></div>
        </div>
      </div>
    </div>
  );
}