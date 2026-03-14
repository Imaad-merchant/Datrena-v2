import React, { useState, useEffect, useRef } from "react";
import { Activity, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const WS_URL = "wss://elsa-censureless-joyce.ngrok-free.dev";
const TICK_SIZE = 0.25;
const MAX_CANDLES = 15;

export default function FootprintChart() {
  const navigate = useNavigate();
  const [candles, setCandles] = useState({});
  const [ohlc, setOhlc] = useState({});
  const [status, setStatus] = useState("disconnected");
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onopen = () => setStatus("connected");
    ws.onerror = () => setStatus("error");
    ws.onclose = () => setStatus("disconnected");
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.type !== "trade") return;
      const bucket = new Date(d.timestamp).toISOString().slice(0, 16);
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
        if (!o[bucket]) o[bucket] = { o: d.price, h: d.price, l: d.price, c: d.price };
        o[bucket].h = Math.max(o[bucket].h, d.price);
        o[bucket].l = Math.min(o[bucket].l, d.price);
        o[bucket].c = d.price;
        return o;
      });
    };
    return () => ws.close();
  }, []);

  const buckets = Object.keys(candles).sort().slice(-MAX_CANDLES);
  const allPrices = new Set();
  buckets.forEach(b => Object.keys(candles[b]).forEach(p => allPrices.add(parseFloat(p))));
  const prices = Array.from(allPrices).sort((a, b) => b - a);
  const minP = prices.length ? Math.min(...prices) : 0;
  const maxP = prices.length ? Math.max(...prices) : 1;
  const range = maxP - minP || 1;

  const volProfile = {};
  buckets.forEach(b => {
    Object.entries(candles[b]).forEach(([p, v]) => {
      volProfile[p] = (volProfile[p] || 0) + v.b + v.a;
    });
  });
  const maxVol = Math.max(...Object.values(volProfile), 1);

  const cellH = 24;
  const candleW = 80;

  return (
    <div style={{ minHeight: "100vh", background: "#131722", color: "#d1d4dc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif" }}>
      <div style={{ borderBottom: "1px solid #2a2e39", background: "#1e222d", padding: "10px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("Terminal"))} style={{ color: "#787b86", background: "transparent", border: "none" }}>
          <ArrowLeft size={18} />
        </Button>
        <span style={{ fontWeight: 500, fontSize: 14, color: "#d1d4dc", letterSpacing: "0.3px" }}>NQM5 · Footprint Chart</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: status === "connected" ? "#26a69a" : status === "error" ? "#ef5350" : "#787b86" }} />
          <span style={{ color: "#787b86", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.5px" }}>{status}</span>
        </div>
      </div>

      {status !== "connected" || buckets.length === 0 ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400, color: "#787b86", fontSize: 13 }}>
          {status === "connected" ? "Waiting for market data..." : "Connecting..."}
        </div>
      ) : (
        <div style={{ overflowX: "auto", overflowY: "auto", padding: 0, background: "#131722" }}>
          <div style={{ display: "flex", alignItems: "flex-start", minHeight: "calc(100vh - 50px)" }}>

            {/* Volume profile */}
            <div style={{ display: "flex", flexDirection: "column", background: "#1e222d", borderRight: "1px solid #2a2e39" }}>
              {prices.map(p => {
                const v = volProfile[p] || 0;
                const w = Math.round((v / maxVol) * 60);
                return (
                  <div key={p} style={{ height: cellH, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 4 }}>
                    <div style={{ height: 16, width: w, background: "#2962ff", opacity: 0.3 }} />
                  </div>
                );
              })}
            </div>

            {/* Price axis */}
            <div style={{ display: "flex", flexDirection: "column", background: "#1e222d", borderRight: "1px solid #2a2e39", minWidth: 70 }}>
              {prices.map(p => (
                <div key={p} style={{ height: cellH, display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: 11, color: "#787b86", paddingRight: 8, fontWeight: 500 }}>
                  {p.toFixed(2)}
                </div>
              ))}
            </div>

            {/* Candle columns */}
            <div style={{ display: "flex", background: "#131722" }}>
              {buckets.map(bucket => {
                const bar = ohlc[bucket] || {};
                const isGreen = bar.c >= bar.o;
                const bodyTop = maxP - Math.max(bar.o, bar.c);
                const bodyH = Math.abs(bar.c - bar.o);
                const wickTop = maxP - bar.h;
                const wickH = bar.h - bar.l;
                const delta = Object.values(candles[bucket] || {}).reduce((s, v) => s + (v.a - v.b), 0);
                const totalVol = Object.values(candles[bucket] || {}).reduce((s, v) => s + v.a + v.b, 0);

                return (
                  <div key={bucket} style={{ display: "flex", flexDirection: "column", borderRight: "1px solid #2a2e39" }}>

                    {/* Candlestick */}
                    <div style={{ position: "relative", width: candleW, height: prices.length * cellH * 0.25, minHeight: 80, background: "#1e222d", borderBottom: "1px solid #2a2e39" }}>
                      <div style={{
                        position: "absolute", left: "50%", transform: "translateX(-50%)",
                        top: `${(wickTop / range) * 100}%`,
                        height: `${(wickH / range) * 100}%`,
                        width: 1, background: isGreen ? "#089981" : "#f23645"
                      }} />
                      <div style={{
                        position: "absolute", left: "50%", transform: "translateX(-50%)",
                        top: `${(bodyTop / range) * 100}%`,
                        height: `${Math.max((bodyH / range) * 100, 2)}%`,
                        width: 16, background: isGreen ? "#089981" : "#f23645", border: isGreen ? "1px solid #089981" : "1px solid #f23645"
                      }} />
                    </div>

                    {/* Footprint cells */}
                    {prices.map(p => {
                      const cell = (candles[bucket] || {})[p] || { b: 0, a: 0 };
                      const total = cell.b + cell.a;
                      const askDom = cell.a > cell.b;
                      const imbalance = total > 0 && ((cell.b > 0 ? cell.a / cell.b >= 3 : false) || (cell.a > 0 ? cell.b / cell.a >= 3 : false));
                      const intensity = total > 0 ? Math.min((Math.max(cell.b, cell.a) / 150), 1) : 0;
                      const bg = total === 0 ? "#131722" :
                        askDom ? `rgba(8,153,129,${0.1 + intensity * 0.5})` : `rgba(242,54,69,${0.1 + intensity * 0.5})`;

                      return (
                        <div key={p} style={{
                          height: cellH, width: candleW,
                          background: bg,
                          borderBottom: "1px solid #2a2e39",
                          borderRight: imbalance ? "2px solid #ffffff" : "none",
                          borderLeft: imbalance ? "2px solid #ffffff" : "none",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontWeight: 600, fontFamily: "monospace",
                          color: total === 0 ? "transparent" : askDom ? "#089981" : "#f23645"
                        }}>
                          {total > 0 ? `${cell.b} × ${cell.a}` : ""}
                        </div>
                      );
                    })}

                    {/* Delta row */}
                    <div style={{ 
                      height: 26, width: candleW, 
                      display: "flex", alignItems: "center", justifyContent: "center", 
                      fontSize: 11, fontWeight: 700, 
                      borderBottom: "1px solid #2a2e39",
                      background: delta > 0 ? "rgba(8,153,129,0.1)" : delta < 0 ? "rgba(242,54,69,0.1)" : "#1e222d",
                      color: delta > 0 ? "#089981" : delta < 0 ? "#f23645" : "#787b86"
                    }}>
                      {delta > 0 ? "+" : ""}{delta}
                    </div>

                    {/* Volume row */}
                    <div style={{ 
                      height: 24, width: candleW, 
                      display: "flex", alignItems: "center", justifyContent: "center", 
                      fontSize: 10, color: "#787b86", 
                      borderBottom: "1px solid #2a2e39",
                      background: "#1e222d"
                    }}>
                      {totalVol}
                    </div>

                    {/* Time label */}
                    <div style={{ 
                      height: 22, width: candleW, 
                      display: "flex", alignItems: "center", justifyContent: "center", 
                      fontSize: 10, color: "#787b86",
                      background: "#1e222d"
                    }}>
                      {bucket.slice(11, 16)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}