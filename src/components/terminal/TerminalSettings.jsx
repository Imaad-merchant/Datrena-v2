import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Play, Loader2 } from "lucide-react";

const COMMON_TICKERS = ["ES=F", "NQ=F", "SPY", "QQQ", "AAPL", "TSLA", "MSFT", "BTC-USD", "GC=F", "CL=F"];
const TIMEFRAMES = ["1m", "2m", "5m", "15m", "30m", "1h", "4h", "1d"];

export default function TerminalSettings({ symbol, setSymbol, lookbackDays, setLookbackDays, timeframe, setTimeframe, onRun, loading }) {
  return (
    <div className="border-b border-gray-800 bg-gray-900/60 px-6 py-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Label className="text-gray-400 text-sm whitespace-nowrap">Symbol</Label>
          <Input
            value={symbol}
            onChange={e => setSymbol(e.target.value.toUpperCase())}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-yellow-500 w-32"
            placeholder="e.g. ES=F"
            onKeyDown={e => e.key === 'Enter' && onRun()}
          />
        </div>

        <Button
          onClick={onRun}
          disabled={loading || !symbol}
          className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-6"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
          ) : (
            <><Play className="w-4 h-4 mr-2" /> Run Analysis</>
          )}
        </Button>

        <div className="ml-auto flex items-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-2"><span className="text-indigo-400">Asia</span><span>20:00–00:00</span></div>
          <div className="flex items-center gap-2"><span className="text-blue-400">London</span><span>02:00–05:00</span></div>
          <div className="flex items-center gap-2"><span className="text-orange-400">NY AM</span><span>08:30–11:00</span></div>
          <div className="flex items-center gap-2"><span className="text-green-400">NY PM</span><span>13:30–16:00</span></div>
        </div>
      </div>
    </div>
  );
}