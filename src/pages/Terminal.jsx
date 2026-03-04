import React, { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import TerminalSettings from "../components/terminal/TerminalSettings";
import VolatilityHeatmap from "../components/terminal/VolatilityHeatmap";
import AIChat from "../components/terminal/AIChat";
import { AlertCircle, Loader2, Activity } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Terminal() {
  const [symbol, setSymbol] = useState("NQ=F");
  const [lookbackDays, setLookbackDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await base44.functions.invoke("fetchStockData", {
        symbol,
        days: lookbackDays,
      });
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [symbol, lookbackDays]);

  const aiContext = data?.sdLevels
    ? `Ticker: ${symbol}
Analysis Window: ${lookbackDays} days
Current Price: ${data.rows[data.rows.length - 1]?.close?.toFixed(2) ?? "N/A"}
NY Open Price: ${data.nyOpenPrice?.toFixed(2) ?? "N/A"}

London Session SD Levels:
  Mean: ${data.sdLevels.mean?.toFixed(2)}
  StdDev: ${data.sdLevels.std?.toFixed(2)}
  +1.0 SD: ${data.sdLevels.plus1?.toFixed(2)}
  +1.5 SD: ${data.sdLevels.plus1_5?.toFixed(2)}
  +2.0 SD: ${data.sdLevels.plus2?.toFixed(2)}
  +2.5 SD: ${data.sdLevels.plus2_5?.toFixed(2)}
  -1.0 SD: ${data.sdLevels.minus1?.toFixed(2)}
  -1.5 SD: ${data.sdLevels.minus1_5?.toFixed(2)}
  -2.0 SD: ${data.sdLevels.minus2?.toFixed(2)}
  -2.5 SD: ${data.sdLevels.minus2_5?.toFixed(2)}`
    : "";

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="border-b border-gray-800 bg-gray-900/80 backdrop-blur px-6 py-4 flex items-center gap-3">
        <Activity className="w-6 h-6 text-yellow-400" />
        <h1 className="text-xl font-bold tracking-wide text-white">⚡ Alpha Quant Terminal</h1>
        {data && (
          <span className="ml-auto text-sm text-gray-400">
            {data.meta?.longName || symbol} · {data.rows.length} bars
          </span>
        )}
      </div>

      <div className="flex h-[calc(100vh-65px)]">
        {/* Sidebar */}
        <div className="w-72 border-r border-gray-800 bg-gray-900 p-4 flex-shrink-0 overflow-y-auto">
          <TerminalSettings
            symbol={symbol}
            setSymbol={setSymbol}
            lookbackDays={lookbackDays}
            setLookbackDays={setLookbackDays}
            onRun={fetchData}
            loading={loading}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {error && (
            <Alert className="border-red-800 bg-red-950 text-red-300">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading && (
            <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
              <span>Fetching market data...</span>
            </div>
          )}

          {data && !loading && (
            <>
              <SDMetrics sdLevels={data.sdLevels} currentPrice={data.rows[data.rows.length - 1]?.close} />
              <PriceChart rows={data.rows} sdLevels={data.sdLevels} symbol={symbol} />
              <VolatilityHeatmap hourlyVol={data.hourlyVol} />
              <AIChat context={aiContext} />
            </>
          )}

          {!data && !loading && !error && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-2">
              <Activity className="w-10 h-10 text-gray-700" />
              <p className="text-sm">Configure settings and click <span className="text-yellow-400 font-semibold">Run Analysis</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}