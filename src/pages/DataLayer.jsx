import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import MainNav from "../components/navigation/MainNav";
import { base44 } from "@/api/base44Client";

const WS_URL = "wss://elsa-censureless-joyce.ngrok-free.dev";
const TICK_SIZE = 0.25;
const MAX_CANDLES = 25;
const CELL_H = 19;
const CELL_W = 78;
const SUMMARY_H = 20;

function seededRandom(seed) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function distributeVolume(open, high, low, close, volume, timeSeed) {
  const levels = {};
  if (!volume || volume === 0) return levels;

  const minP = parseFloat((Math.floor(low / TICK_SIZE) * TICK_SIZE).toFixed(2));
  const maxP = parseFloat((Math.ceil(high / TICK_SIZE) * TICK_SIZE).toFixed(2));
  const isGreen = close >= open;

  if (Math.abs(maxP - minP) < TICK_SIZE * 0.5) {
    levels[minP] = {
      b: Math.round(volume * (isGreen ? 0.4 : 0.6)),
      a: Math.round(volume * (isGreen ? 0.6 : 0.4)),
    };
    return levels;
  }

  const prices = [];
  for (let p = minP; p <= maxP + TICK_SIZE * 0.01; p += TICK_SIZE) {
    prices.push(parseFloat(p.toFixed(2)));
  }
  if (prices.length === 0) prices.push(minP);

  const mid = (high + low) / 2;
  const range = maxP - minP || TICK_SIZE;
  const sigma = range / 2.5;

  let weights = prices.map((p) => Math.exp((-0.5 * (p - mid) ** 2) / (sigma * sigma)));
  const tw = weights.reduce((s, w) => s + w, 0) || 1;
  weights = weights.map((w) => w / tw);

  const openP = parseFloat((Math.round(open / TICK_SIZE) * TICK_SIZE).toFixed(2));
  const closeP = parseFloat((Math.round(close / TICK_SIZE) * TICK_SIZE).toFixed(2));

  prices.forEach((p, i) => {
    const levelVol = Math.max(1, Math.round(volume * weights[i]));
    const r = seededRandom(timeSeed + p * 137 + i * 31);

    let askRatio;
    if (isGreen) {
      askRatio = p > closeP ? 0.55 + r * 0.25 : p < openP ? 0.2 + r * 0.2 : 0.4 + r * 0.25;
    } else {
      askRatio = p > openP ? 0.2 + r * 0.2 : p < closeP ? 0.55 + r * 0.25 : 0.35 + r * 0.25;
    }

    levels[p] = {
      b: Math.round(levelVol * (1 - askRatio)),
      a: Math.round(levelVol * askRatio),
    };
  });

  return levels;
}

function formatNum(n) {
  if (Math.abs(n) >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (Math.abs(n) >= 10000) return (n / 1000).toFixed(0) + "k";
  if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

const SUMMARY_LABELS = ["Ask", "Bid", "Delta", "Cum.Δ", "Vol", "Cum.V"];

export default function DataLayer() {
  const [candles, setCandles] = useState({});
  const [ohlc, setOhlc] = useState({});
  const [status, setStatus] = useState("disconnected");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [ticker, setTicker] = useState("ES=F");
  const [timeframe, setTimeframe] = useState("5m");
  const wsRef = useRef(null);
  const gridRef = useRef(null);

  const fetchHistory = useCallback(async (sym, tf) => {
    setLoadingHistory(true);
    try {
      const interval = tf === "1m" ? "1m" : tf === "5m" ? "5m" : tf === "15m" ? "15m" : "30m";
      const range = tf === "1m" ? "1d" : tf === "5m" ? "5d" : tf === "15m" ? "10d" : "30d";

      const res = await base44.functions.invoke("fetchYahooHistory", { symbol: sym, interval, range });
      const json = res.data;
      const result = json?.chart?.result?.[0];
      if (!result) return;

      const timestamps = result.timestamp;
      const q = result.indicators.quote[0];
      const newOhlc = {};
      const newCandles = {};

      timestamps.forEach((ts, i) => {
        if (!q.open[i] || !q.close[i]) return;
        const bucket = new Date(ts * 1000).toISOString().slice(0, 16);
        const bar = {
          time: ts,
          open: parseFloat(q.open[i].toFixed(2)),
          high: parseFloat(q.high[i].toFixed(2)),
          low: parseFloat(q.low[i].toFixed(2)),
          close: parseFloat(q.close[i].toFixed(2)),
        };
        newOhlc[bucket] = bar;
        newCandles[bucket] = distributeVolume(bar.open, bar.high, bar.low, bar.close, q.volume[i] || 0, ts);
      });

      setOhlc(newOhlc);
      setCandles(newCandles);
    } catch (err) {
      console.error("Yahoo Finance fetch failed", err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchHistory(ticker, timeframe), 300);
    return () => clearTimeout(timer);
  }, [ticker, timeframe, fetchHistory]);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onopen = () => setStatus("connected");
    ws.onerror = () => setStatus("error");
    ws.onclose = () => setStatus("disconnected");
    ws.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        if (d.type === "trade") {
          const ts = new Date(d.timestamp);
          const bucket = ts.toISOString().slice(0, 16);
          const pl = parseFloat((Math.round(d.price / TICK_SIZE) * TICK_SIZE).toFixed(2));

          setCandles((prev) => {
            const c = { ...prev };
            if (!c[bucket]) c[bucket] = {};
            if (!c[bucket][pl]) c[bucket][pl] = { b: 0, a: 0 };
            c[bucket][pl].b += d.bid_volume || 0;
            c[bucket][pl].a += d.ask_volume || 0;
            return c;
          });

          setOhlc((prev) => {
            const o = { ...prev };
            const t = Math.floor(ts.getTime() / 60000) * 60;
            if (!o[bucket]) o[bucket] = { time: t, open: d.price, high: d.price, low: d.price, close: d.price };
            o[bucket].high = Math.max(o[bucket].high, d.price);
            o[bucket].low = Math.min(o[bucket].low, d.price);
            o[bucket].close = d.price;
            return o;
          });
        }
      } catch (err) {
        console.error("WS parse error", err);
      }
    };
    return () => ws.close();
  }, []);

  const buckets = useMemo(() => Object.keys(candles).sort().slice(-MAX_CANDLES), [candles]);

  const allPrices = useMemo(() => {
    const ps = new Set();
    buckets.forEach((b) => Object.keys(candles[b]).forEach((p) => ps.add(parseFloat(p))));
    return Array.from(ps).sort((a, b) => b - a);
  }, [buckets, candles]);

  const volProfile = useMemo(() => {
    const vp = {};
    buckets.forEach((b) => {
      Object.entries(candles[b] || {}).forEach(([p, v]) => {
        vp[p] = (vp[p] || 0) + v.b + v.a;
      });
    });
    return vp;
  }, [buckets, candles]);

  const maxVol = useMemo(() => Math.max(...Object.values(volProfile), 1), [volProfile]);

  const summaryData = useMemo(() => {
    let cumDelta = 0;
    let cumVol = 0;
    return buckets.map((bucket) => {
      const cells = candles[bucket] || {};
      let askTotal = 0,
        bidTotal = 0;
      Object.values(cells).forEach((c) => {
        askTotal += c.a;
        bidTotal += c.b;
      });
      const delta = askTotal - bidTotal;
      const vol = askTotal + bidTotal;
      cumDelta += delta;
      cumVol += vol;
      return { ask: askTotal, bid: bidTotal, delta, cumDelta, vol, cumVol };
    });
  }, [buckets, candles]);

  const tickerLabel = ticker.replace("=F", "");

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e0e0e0", fontFamily: "monospace", paddingLeft: "4rem" }}>
      <MainNav />

      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid #1e1e2e",
          background: "#0f0f1a",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 15, fontFamily: "sans-serif", color: "#fff" }}>
          {tickerLabel} · Order Flow
        </span>

        <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
          {["1m", "5m", "15m", "30m"].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                background: timeframe === tf ? "#1e3a5f" : "transparent",
                border: "1px solid #1e1e2e",
                color: timeframe === tf ? "#60a5fa" : "#555",
                borderRadius: 4,
                padding: "2px 10px",
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "sans-serif",
              }}
            >
              {tf}
            </button>
          ))}
        </div>

        <select
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          style={{
            background: "#111827",
            border: "1px solid #1e1e2e",
            color: "#aaa",
            borderRadius: 4,
            padding: "2px 8px",
            fontSize: 11,
            fontFamily: "sans-serif",
            cursor: "pointer",
          }}
        >
          <option value="ES=F">ES Futures</option>
          <option value="NQ=F">NQ Futures</option>
          <option value="CL=F">CL Futures</option>
          <option value="GC=F">GC Futures</option>
        </select>

        <Button variant="ghost" size="icon" onClick={() => fetchHistory(ticker, timeframe)} style={{ color: "#555" }}>
          <RefreshCw size={14} />
        </Button>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, fontSize: 12, fontFamily: "sans-serif" }}>
          {loadingHistory && <span style={{ color: "#f59e0b", fontSize: 11 }}>Loading...</span>}
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: status === "connected" ? "#22c55e" : status === "error" ? "#ef4444" : "#555",
              }}
            />
            <span style={{ color: "#666" }}>{status}</span>
          </div>
        </div>
      </div>

      {/* Footprint Chart */}
      {loadingHistory && allPrices.length === 0 ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "calc(100vh - 90px)",
            color: "#555",
            fontSize: 14,
            fontFamily: "sans-serif",
          }}
        >
          Loading order flow data...
        </div>
      ) : allPrices.length === 0 ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "calc(100vh - 90px)",
            color: "#555",
            fontSize: 14,
            fontFamily: "sans-serif",
          }}
        >
          No data available. Check ticker and timeframe.
        </div>
      ) : (
        <div ref={gridRef} style={{ overflow: "auto", height: "calc(100vh - 90px)" }}>
          <div style={{ display: "inline-flex", alignItems: "flex-start", minWidth: "100%" }}>
            {/* Volume Profile - sticky left */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                position: "sticky",
                left: 0,
                zIndex: 3,
                background: "#0a0a0f",
              }}
            >
              {allPrices.map((p) => {
                const v = volProfile[p] || 0;
                const w = Math.round((v / maxVol) * 50);
                const isPOC = v === maxVol;
                return (
                  <div
                    key={p}
                    style={{
                      height: CELL_H,
                      width: 54,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      paddingRight: 2,
                    }}
                  >
                    <div
                      style={{
                        height: Math.max(2, CELL_H - 6),
                        width: w,
                        background: isPOC ? "#7c3aed" : "#1d4e89",
                        borderRadius: 1,
                        opacity: 0.8,
                      }}
                    />
                  </div>
                );
              })}
              {/* Spacer for summary rows */}
              {SUMMARY_LABELS.map((label) => (
                <div
                  key={label}
                  style={{
                    height: SUMMARY_H,
                    width: 54,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingRight: 4,
                    fontSize: 9,
                    fontFamily: "sans-serif",
                    fontWeight: 600,
                    color: label === "Ask" ? "#4ade80" : label === "Bid" ? "#f87171" : label === "Delta" || label === "Cum.Δ" ? "#60a5fa" : "#555",
                    borderTop: label === "Ask" ? "2px solid #1e1e2e" : "1px solid #0f172a",
                  }}
                >
                  {label}
                </div>
              ))}
              {/* Time row spacer */}
              <div style={{ height: 22, width: 54 }} />
            </div>

            {/* Price Axis - sticky left */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                position: "sticky",
                left: 54,
                zIndex: 3,
                background: "#0a0a0f",
                borderRight: "1px solid #1e1e2e",
                minWidth: 62,
              }}
            >
              {allPrices.map((p) => {
                const isPOC = (volProfile[p] || 0) === maxVol;
                return (
                  <div
                    key={p}
                    style={{
                      height: CELL_H,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      paddingRight: 5,
                      fontSize: 10,
                      color: isPOC ? "#f59e0b" : "#444",
                      fontWeight: isPOC ? 700 : 400,
                    }}
                  >
                    {p.toFixed(2)}
                  </div>
                );
              })}
              {/* Summary row labels */}
              {SUMMARY_LABELS.map((label) => (
                <div key={label} style={{ height: SUMMARY_H, borderTop: label === "Ask" ? "2px solid #1e1e2e" : "1px solid #0f172a" }} />
              ))}
              <div style={{ height: 22 }} />
            </div>

            {/* Candle Columns */}
            {buckets.map((bucket, bi) => {
              const summary = summaryData[bi];
              const isLive = bi === buckets.length - 1;
              const bar = ohlc[bucket];
              const openP = bar ? parseFloat((Math.round(bar.open / TICK_SIZE) * TICK_SIZE).toFixed(2)) : null;
              const closeP = bar ? parseFloat((Math.round(bar.close / TICK_SIZE) * TICK_SIZE).toFixed(2)) : null;
              const highP = bar ? parseFloat((Math.round(bar.high / TICK_SIZE) * TICK_SIZE).toFixed(2)) : null;
              const lowP = bar ? parseFloat((Math.round(bar.low / TICK_SIZE) * TICK_SIZE).toFixed(2)) : null;
              const isGreen = bar ? bar.close >= bar.open : true;

              return (
                <div
                  key={bucket}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginRight: 1,
                    outline: isLive ? "1px solid #2a3a5e" : "none",
                    borderRadius: isLive ? 2 : 0,
                  }}
                >
                  {/* Price level cells */}
                  {allPrices.map((p) => {
                    const cell = (candles[bucket] || {})[p];
                    const total = cell ? cell.b + cell.a : 0;
                    const inRange = bar && p <= highP && p >= lowP;
                    const inBody =
                      bar &&
                      ((isGreen && p >= openP && p <= closeP) || (!isGreen && p >= closeP && p <= openP));

                    if (!cell || total === 0) {
                      return (
                        <div
                          key={p}
                          style={{
                            height: CELL_H,
                            width: CELL_W,
                            background: inBody
                              ? isGreen
                                ? "rgba(22,163,74,0.04)"
                                : "rgba(220,38,38,0.04)"
                              : "#0a0a0f",
                            border: "1px solid #0f172a",
                          }}
                        />
                      );
                    }

                    const askDom = cell.a >= cell.b;
                    const ratio = askDom
                      ? cell.b > 0
                        ? cell.a / cell.b
                        : cell.a > 0
                        ? 999
                        : 1
                      : cell.a > 0
                      ? cell.b / cell.a
                      : cell.b > 0
                      ? 999
                      : 1;
                    const imbalance = total > 5 && ratio >= 3;
                    const isPOC = (volProfile[p] || 0) === maxVol;
                    const intensity = Math.min(Math.max(cell.b, cell.a) / 400, 1);

                    const bg = askDom
                      ? `rgba(22,163,74,${0.06 + intensity * 0.5})`
                      : `rgba(220,38,38,${0.06 + intensity * 0.5})`;

                    let borderStyle;
                    if (imbalance) {
                      borderStyle = askDom
                        ? "1px solid rgba(34,197,94,0.7)"
                        : "1px solid rgba(239,68,68,0.7)";
                    } else if (isPOC) {
                      borderStyle = "1px solid rgba(245,158,11,0.4)";
                    } else {
                      borderStyle = "1px solid #0f172a";
                    }

                    return (
                      <div
                        key={p}
                        style={{
                          height: CELL_H,
                          width: CELL_W,
                          background: bg,
                          border: borderStyle,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: "0.2px",
                          gap: 1,
                        }}
                      >
                        <span
                          style={{
                            color: !askDom ? "#fca5a5" : "#888",
                            fontWeight: !askDom ? 800 : 500,
                            textDecoration: imbalance && !askDom ? "underline" : "none",
                          }}
                        >
                          {cell.b}
                        </span>
                        <span style={{ color: "#3a3a4a", fontSize: 8 }}>×</span>
                        <span
                          style={{
                            color: askDom ? "#86efac" : "#888",
                            fontWeight: askDom ? 800 : 500,
                            textDecoration: imbalance && askDom ? "underline" : "none",
                          }}
                        >
                          {cell.a}
                        </span>
                      </div>
                    );
                  })}

                  {/* Summary Rows */}
                  {/* Ask */}
                  <div
                    style={{
                      height: SUMMARY_H,
                      width: CELL_W,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 600,
                      fontFamily: "sans-serif",
                      background: "rgba(22,163,74,0.06)",
                      borderTop: "2px solid #1e1e2e",
                      color: "#4ade80",
                    }}
                  >
                    {formatNum(summary.ask)}
                  </div>
                  {/* Bid */}
                  <div
                    style={{
                      height: SUMMARY_H,
                      width: CELL_W,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 600,
                      fontFamily: "sans-serif",
                      background: "rgba(220,38,38,0.06)",
                      borderTop: "1px solid #0f172a",
                      color: "#f87171",
                    }}
                  >
                    {formatNum(summary.bid)}
                  </div>
                  {/* Delta */}
                  <div
                    style={{
                      height: SUMMARY_H,
                      width: CELL_W,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 800,
                      fontFamily: "sans-serif",
                      borderTop: "1px solid #0f172a",
                      background: summary.delta >= 0 ? "rgba(96,165,250,0.06)" : "rgba(244,114,182,0.06)",
                      color: summary.delta >= 0 ? "#60a5fa" : "#f472b6",
                    }}
                  >
                    {summary.delta > 0 ? "+" : ""}
                    {formatNum(summary.delta)}
                  </div>
                  {/* Cum Delta */}
                  <div
                    style={{
                      height: SUMMARY_H,
                      width: CELL_W,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: "sans-serif",
                      borderTop: "1px solid #0f172a",
                      background: summary.cumDelta >= 0 ? "rgba(96,165,250,0.04)" : "rgba(244,114,182,0.04)",
                      color: summary.cumDelta >= 0 ? "#93c5fd" : "#f9a8d4",
                    }}
                  >
                    {formatNum(summary.cumDelta)}
                  </div>
                  {/* Volume */}
                  <div
                    style={{
                      height: SUMMARY_H,
                      width: CELL_W,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 600,
                      fontFamily: "sans-serif",
                      borderTop: "1px solid #0f172a",
                      color: "#666",
                    }}
                  >
                    {formatNum(summary.vol)}
                  </div>
                  {/* Cum Volume */}
                  <div
                    style={{
                      height: SUMMARY_H,
                      width: CELL_W,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 500,
                      fontFamily: "sans-serif",
                      borderTop: "1px solid #0f172a",
                      color: "#444",
                    }}
                  >
                    {formatNum(summary.cumVol)}
                  </div>

                  {/* Time */}
                  <div
                    style={{
                      height: 22,
                      width: CELL_W,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      color: isLive ? "#60a5fa" : "#2a2a3a",
                      fontFamily: "sans-serif",
                      borderTop: "1px solid #1e1e2e",
                      fontWeight: isLive ? 700 : 400,
                    }}
                  >
                    {bucket.slice(11, 16)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div
            style={{
              display: "flex",
              gap: 16,
              padding: "12px 20px 16px 120px",
              fontSize: 10,
              color: "#444",
              fontFamily: "sans-serif",
              flexWrap: "wrap",
              position: "sticky",
              left: 0,
            }}
          >
            <span>
              <span style={{ color: "#86efac" }}>■</span> Ask dominant
            </span>
            <span>
              <span style={{ color: "#fca5a5" }}>■</span> Bid dominant
            </span>
            <span>
              <span style={{ color: "rgba(34,197,94,0.7)", fontWeight: 700 }}>□</span> Imbalance ≥3:1
            </span>
            <span>
              <span style={{ color: "#7c3aed" }}>■</span> POC
            </span>
            <span>
              <span style={{ color: "#f59e0b" }}>■</span> POC price
            </span>
            <span>
              <span style={{ color: "#60a5fa" }}>■</span> Δ+
            </span>
            <span>
              <span style={{ color: "#f472b6" }}>■</span> Δ−
            </span>
            {status === "connected" && (
              <span style={{ color: "#2a3a5e", border: "1px solid #2a3a5e", padding: "0 4px", borderRadius: 2 }}>
                Live
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
