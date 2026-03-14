import React, { useState, useEffect, useRef } from "react";
import { Activity, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const WS_URL = "wss://elsa-censureless-joyce.ngrok-free.dev";
const TICK_SIZE = 0.25;
const MAX_CANDLES = 20;
const CELL_H = 22;
const CELL_W = 64;

export default function FootprintChart() {
  const navigate = useNavigate();
  const [candles, setCandles] = useState({});
  const [ohlc, setOhlc] = useState({});
  const [status, setStatus] = useState("disconnected");
  const chartRef = useRef(null);
  const tvChartRef = useRef(null);
  const seriesRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js";
    script.onload = () => {
      if (!chartRef.current || tvChartRef.current) return;
      const chart = window.LightweightCharts.createChart(chartRef.current, {
        width: chartRef.current.clientWidth,
        height: 220,
        layout: { background: { color: "#0a0a0f" }, textColor: "#666" },
        grid: { vertLines: { color: "#1a1a2e" }, horzLines: { color: "#1a1a2e" } },
        rightPriceScale: { borderColor: "#1e1e2e" },
        timeScale: { borderColor: "#1e1e2e", timeVisible: true },
      });
      const series = chart.addCandlestickSeries({
        upColor: "#16a34a", downColor: "#dc2626",
        borderUpColor: "#22c55e", borderDownColor: "#ef4444",
        wickUpColor: "#22c55e", wickDownColor: "#ef4444",
      });
      tvChartRef.current = chart;
      seriesRef.current = series;
    };
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch(e) {} };
  }, []);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onopen = () => setStatus("connected");
    ws.onerror = () => setStatus("error");
    ws.onclose = () => setStatus("disconnected");
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.type !== "trade") return;
      const ts = new Date(d.timestamp);
      const bucket = ts.toISOString().slice(0, 16);
      const pl = Math.round(d.price / TICK_SIZE) * TICK_SIZE;

      setCandles(prev => {
        const c = { ...prev };
        if (!c[bucket]) c[bucket] = {};
        if (!c[bucket][pl]) c[bucket][pl] = { b: 0, a: 0 };
        c[bucket][pl].b += d.bid_volume || 0;
        c[bucket][pl].a += d.ask_volume || 0;
        return c;
      });

      setOhlc(prev => {
        const o = { ...prev };
        const t = Math.floor(ts.getTime() / 60000) * 60;
        if (!o[bucket]) o[bucket] = { time: t, open: d.price, high: d.price, low: d.price, close: d.price };
        o[bucket].high = Math.max(o[bucket].high, d.price);
        o[bucket].low = Math.min(o[bucket].low, d.price);
        o[bucket].close = d.price;
        if (seriesRef.current) {
          const bars = Object.values({ ...o }).sort((a, b) => a.time - b.time);
          seriesRef.current.setData(bars);
        }
        return o;
      });
    };
    return () => ws.close();
  }, []);

  const buckets = Object.keys(candles).sort().slice(-MAX_CANDLES);
  const allPrices = new Set();
  buckets.forEach(b => Object.keys(candles[b]).forEach(p => allPrices.add(parseFloat(p))));
  const prices = Array.from(allPrices).sort((a, b) => b - a);

  const volProfile = {};
  buckets.forEach(b => {
    Object.entries(candles[b]).forEach(([p, v]) => {
      volProfile[p] = (volProfile[p] || 0) + v.b + v.a;
    });
  });
  const maxVol = Math.max(...Object.values(volProfile), 1);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e0e0e0", fontFamily: "monospace" }}>

      <div style={{ borderBottom: "1px solid #1e1e2e", background: "#0f0f1a", padding: "10px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("Terminal"))} style={{ color: "#666" }}>
          <ArrowLeft size={16} />
        </Button>
        <Activity size={18} color="#f59e0b" />
        <span style={{ fontWeight: 600, fontSize: 15, fontFamily: "sans-serif", color: "#fff" }}>NQM5 · Footprint</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: status === "connected" ? "#22c55e" : status === "error" ? "#ef4444" : "#555" }} />
          <span style={{ color: "#888", fontFamily: "sans-serif" }}>{status}</span>
        </div>
      </div>

      <div ref={chartRef} style={{ width: "100%", height: 220, borderBottom: "1px solid #1e1e2e" }} />

      {status !== "connected" || buckets.length === 0 ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "#555", fontSize: 13, fontFamily: "sans-serif" }}>
          {status === "connected" ? "Waiting for data..." : "Connecting..."}
        </div>
      ) : (
        <div style={{ overflowX: "auto", padding: "12px 8px" }}>
          <div style={{ display: "flex", alignItems: "flex-start" }}>

            <div style={{ display: "flex", flexDirection: "column", marginRight: 2 }}>
              {prices.map(p => {
                const v = volProfile[p] || 0;
                const w = Math.round((v / maxVol) * 48);
                return (
                  <div key={p} style={{ height: CELL_H, display: "flex", alignItems: "center", justifyContent: "flex-end", width: 52 }}>
                    <div style={{ height: 14, width: w, background: v > maxVol * 0.7 ? "#7c3aed" : "#1d4e89", borderRadius: 1 }} />
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", flexDirection: "column", marginRight: 6, minWidth: 58 }}>
              {prices.map(p => (
                <div key={p} style={{ height: CELL_H, display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: 10, color: "#555", paddingRight: 4, borderRight: "1px solid #1e1e2e" }}>
                  {p.toFixed(2)}
                </div>
              ))}
            </div>

            {buckets.map((bucket, bi) => {
              const delta = Object.values(candles[bucket] || {}).reduce((s, v) => s + (v.a - v.b), 0);
              const totalVol = Object.values(candles[bucket] || {}).reduce((s, v) => s + v.a + v.b, 0);
              const isLast = bi === buckets.length - 1;

              return (
                <div key={bucket} style={{ display: "flex", flexDirection: "column", marginRight: 1, outline: isLast ? "1px solid #2a3a5e" : "none" }}>
                  {prices.map(p => {
                    const cell = (candles[bucket] || {})[p] || { b: 0, a: 0 };
                    const total = cell.b + cell.a;
                    const askDom = cell.a >= cell.b;
                    const imbalance = total > 0 && (
                      (cell.b > 0 && cell.a / cell.b >= 3) ||
                      (cell.a > 0 && cell.b / cell.a >= 3)
                    );
                    const isPOC = volProfile[p] === maxVol;
                    const intensity = total > 0 ? Math.min(Math.max(cell.b, cell.a) / 300, 1) : 0;
                    const bg = total === 0 ? "#0d0d14"
                      : askDom ? `rgba(22,163,74,${0.1 + intensity * 0.5})`
                      : `rgba(220,38,38,${0.1 + intensity * 0.5})`;

                    return (
                      <div key={p} style={{
                        height: CELL_H, width: CELL_W, background: bg,
                        border: imbalance ? "1px solid rgba(255,255,255,0.6)"
                          : isPOC ? "1px solid #f59e0b"
                          : "1px solid #111827",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, fontWeight: 700,
                        color: total === 0 ? "transparent" : askDom ? "#86efac" : "#fca5a5",
                      }}>
                        {total > 0 ? `${cell.b} × ${cell.a}` : ""}
                      </div>
                    );
                  })}

                  <div style={{ height: 22, width: CELL_W, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, borderTop: "1px solid #1e1e2e", background: delta >= 0 ? "rgba(96,165,250,0.08)" : "rgba(244,114,182,0.08)", color: delta >= 0 ? "#60a5fa" : "#f472b6" }}>
                    {delta > 0 ? "+" : ""}{delta}
                  </div>

                  <div style={{ height: 18, width: CELL_W, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#444", borderTop: "1px solid #111" }}>
                    {totalVol.toLocaleString()}
                  </div>

                  <div style={{ height: 16, width: CELL_W, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#333", borderTop: "1px solid #111" }}>
                    {bucket.slice(11, 16)}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 16, marginTop: 10, paddingLeft: 116, fontSize: 10, color: "#555", fontFamily: "sans-serif" }}>
            <span><span style={{ color: "#86efac" }}>■</span> Ask dominant</span>
            <span><span style={{ color: "#fca5a5" }}>■</span> Bid dominant</span>
            <span style={{ border: "1px solid rgba(255,255,255,0.4)", padding: "0 4px" }}>Imbalance 3:1</span>
            <span><span style={{ color: "#f59e0b" }}>■</span> POC</span>
            <span><span style={{ color: "#60a5fa" }}>■</span> Delta +</span>
            <span><span style={{ color: "#f472b6" }}>■</span> Delta −</span>
          </div>
        </div>
      )}
    </div>
  );
}
