import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TIMEFRAMES = ["1m", "2m", "5m", "15m", "30m", "1h", "4h", "1d"];

const SESSION_LABELS = {
  0: "Asia", 1: "Asia", 2: "London", 3: "London", 4: "London",
  5: "London", 6: "London", 7: "Pre-NY", 8: "Pre-NY",
  9: "NY Open", 10: "NY", 11: "NY", 12: "NY", 13: "NY Open",
  14: "NY", 15: "NY", 16: "NY Close", 17: "NY Close",
  18: "After", 19: "After", 20: "After", 21: "Asia", 22: "Asia", 23: "Asia",
};

const SESSION_COLORS = {
  "Asia": "#6366f1",
  "London": "#3b82f6",
  "Pre-NY": "#a855f7",
  "NY Open": "#f59e0b",
  "NY": "#22c55e",
  "NY Close": "#f97316",
  "After": "#6b7280",
};

const CustomTooltip = ({ active, payload, tz }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const session = SESSION_LABELS[d.hour] || "";
  const displayHour = d.displayHour ?? d.hour;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs space-y-1">
      <p className="text-gray-300">Hour: <span className="text-white font-bold">{String(displayHour).padStart(2,'0')}:00 {tz === "Local" ? "Local" : "UTC"}</span></p>
      {tz === "Local" && <p className="text-gray-500">UTC: {String(d.hour).padStart(2,'0')}:00</p>}
      <p className="text-gray-300">Session: <span className="font-bold" style={{ color: SESSION_COLORS[session] }}>{session}</span></p>
      <p className="text-gray-300">Avg Range: <span className="text-yellow-400 font-mono font-bold">{d.avg_range.toFixed(4)}</span></p>
      <p className="text-gray-300">Avg Volume: <span className="text-blue-400 font-mono font-bold">{d.avg_volume > 0 ? (d.avg_volume >= 1e6 ? (d.avg_volume/1e6).toFixed(2)+'M' : (d.avg_volume/1e3).toFixed(0)+'K') : '—'}</span></p>
      {d.count === 0 && <p className="text-gray-500 italic">No data for this hour</p>}
    </div>
  );
};

const LOCAL_OFFSET = -new Date().getTimezoneOffset() / 60; // hours offset from UTC

export default function VolatilityHeatmap({ hourlyVol, onTimeframeChange, timeframe }) {
  const [view, setView] = useState("range"); // "range" | "volume"
  const [tz, setTz] = useState("UTC"); // "UTC" | "Local"

  if (!hourlyVol?.length) return null;

  const maxRange = Math.max(...hourlyVol.map(h => h.avg_range));
  const maxVol = Math.max(...hourlyVol.map(h => h.avg_volume));

  const shiftHour = (h) => tz === "Local" ? ((h + LOCAL_OFFSET + 24) % 24) : h;

  // Sort by display hour when local so bars stay in order
  const data = [...hourlyVol]
    .map(h => ({
      ...h,
      displayHour: shiftHour(h.hour),
      session: SESSION_LABELS[h.hour] || "",
      intensity: view === "range"
        ? (maxRange > 0 ? h.avg_range / maxRange : 0)
        : (maxVol > 0 ? h.avg_volume / maxVol : 0),
    }))
    .sort((a, b) => a.displayHour - b.displayHour);

  const dataKey = view === "range" ? "avg_range" : "avg_volume";

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
          Hourly Heatmap · All 24 Hours
        </h2>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={onTimeframeChange}>
            <SelectTrigger className="h-7 w-20 bg-gray-800 border-gray-700 text-gray-300 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {TIMEFRAMES.map(tf => (
                <SelectItem key={tf} value={tf} className="text-gray-300 text-xs focus:bg-gray-700 focus:text-white">
                  {tf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            {["UTC", "Local"].map(t => (
              <button
                key={t}
                onClick={() => setTz(t)}
                className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                  tz === t
                    ? "bg-blue-600 border-blue-600 text-white font-semibold"
                    : "border-gray-700 text-gray-400 hover:border-blue-500 hover:text-blue-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {["range", "volume"].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                  view === v
                    ? "bg-orange-500 border-orange-500 text-gray-900 font-semibold"
                    : "border-gray-700 text-gray-400 hover:border-orange-500 hover:text-orange-400"
                }`}
              >
                {v === "range" ? "Volatility" : "Volume"}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-600 mb-4">
        {view === "range" ? `Average High-Low range by hour (${tz})` : `Average volume by hour (${tz})`}
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <XAxis
            dataKey="displayHour"
            tick={{ fill: "#6b7280", fontSize: 10 }}
            tickLine={false}
            tickFormatter={v => `${String(v).padStart(2,'0')}h`}
            interval={0}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip tz={tz} />} cursor={{ fill: "#1f2937" }} />
          <Bar dataKey={dataKey} radius={[3, 3, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.count > 0 ? (SESSION_COLORS[entry.session] || "#6b7280") : "#1f2937"}
                opacity={entry.count > 0 ? 0.35 + entry.intensity * 0.65 : 0.2}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap gap-3 mt-3">
        {Object.entries(SESSION_COLORS).map(([session, color]) => (
          <div key={session} className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
            {session}
          </div>
        ))}
      </div>
    </div>
  );
}