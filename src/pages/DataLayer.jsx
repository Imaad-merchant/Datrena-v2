import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import MainNav from "../components/navigation/MainNav";
import { base44 } from "@/api/base44Client";

const WS_URL = "wss://elsa-censureless-joyce.ngrok-free.dev";
const TICK_SIZE = 0.25;
const MAX_CANDLES = 20;
const MAX_ROWS = 70;     // max visible price levels — prevents vertical sprawl
const CELL_H = 20;
const CELL_W = 90;       // wider: sell | candle | buy
const CANDLE_W = 6;      // body bar width
const WICK_W = 2;        // wick line width
const SUMMARY_H = 20;
const VOL_PROFILE_W = 52;
const PRICE_AXIS_W = 64;

const SUMMARY_LABELS = ["Ask", "Bid", "Delta", "Cum.Δ", "Vol", "Cum.V"];

/* ── helpers ── */
function seededRandom(seed) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function tp(p) { return parseFloat(p.toFixed(2)); }
function rnd(p) { return tp(Math.round(p / TICK_SIZE) * TICK_SIZE); }

function distributeVolume(open, high, low, close, volume, timeSeed) {
  const levels = {};
  if (!volume) return levels;

  const minP = tp(Math.floor(low / TICK_SIZE) * TICK_SIZE);
  const maxP = tp(Math.ceil(high / TICK_SIZE) * TICK_SIZE);
  const isGreen = close >= open;

  if (Math.abs(maxP - minP) < TICK_SIZE * 0.5) {
    levels[minP] = { b: Math.round(volume * (isGreen ? 0.4 : 0.6)), a: Math.round(volume * (isGreen ? 0.6 : 0.4)) };
    return levels;
  }

  const prices = [];
  for (let p = minP; p <= maxP + TICK_SIZE * 0.01; p += TICK_SIZE) prices.push(tp(p));

  const mid = (high + low) / 2;
  const sigma = (maxP - minP) / 2.5 || TICK_SIZE;
  let weights = prices.map((p) => Math.exp(-0.5 * ((p - mid) / sigma) ** 2));
  const tw = weights.reduce((s, w) => s + w, 0) || 1;
  weights = weights.map((w) => w / tw);

  const openP = rnd(open), closeP = rnd(close);
  prices.forEach((p, i) => {
    const vol = Math.max(1, Math.round(volume * weights[i]));
    const r = seededRandom(timeSeed + p * 137 + i * 31);
    let ar;
    if (isGreen) ar = p > closeP ? 0.55 + r * 0.25 : p < openP ? 0.2 + r * 0.2 : 0.4 + r * 0.25;
    else         ar = p > openP  ? 0.2 + r * 0.2  : p < closeP ? 0.55 + r * 0.25 : 0.35 + r * 0.25;
    levels[p] = { b: Math.round(vol * (1 - ar)), a: Math.round(vol * ar) };
  });
  return levels;
}

function formatNum(n) {
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (Math.abs(n) >= 1e4) return (n / 1e3).toFixed(0) + "k";
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + "k";
  return String(n);
}

/* ── Candle overlay drawn absolutely on each column ── */
function CandleOverlay({ bar, allPrices }) {
  if (!bar) return null;
  const isGreen = bar.close >= bar.open;
  const highP = rnd(bar.high), lowP = rnd(bar.low);
  const openP = rnd(bar.open), closeP = rnd(bar.close);
  const bodyTopP    = isGreen ? closeP : openP;
  const bodyBottomP = isGreen ? openP  : closeP;

  const idx = (target) => {
    const i = allPrices.findIndex((p) => Math.abs(p - target) < TICK_SIZE * 0.6);
    return i >= 0 ? i : null;
  };

  const highIdx      = idx(highP);
  const lowIdx       = idx(lowP);
  const bodyTopIdx   = idx(bodyTopP);
  const bodyBottomIdx = idx(bodyBottomP);
  if (highIdx === null || lowIdx === null) return null;

  const cx     = CELL_W / 2;
  const color  = isGreen ? "#22c55e" : "#ef4444";
  const bodyBg = isGreen ? "rgba(34,197,94,0.80)" : "rgba(239,68,68,0.80)";

  // pixel y positions (top of each row)
  const yTop    = (i) => i * CELL_H;
  const yMid    = (i) => i * CELL_H + CELL_H / 2;
  const yBottom = (i) => (i + 1) * CELL_H;

  const wickTop    = yMid(highIdx);
  const wickBottom = yMid(lowIdx);
  const bodyTop    = bodyTopIdx    !== null ? yTop(bodyTopIdx)       : wickTop;
  const bodyBottom = bodyBottomIdx !== null ? yBottom(bodyBottomIdx) : wickBottom;

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2 }}>
      {/* Full wick */}
      <div style={{
        position: "absolute",
        top: wickTop, left: cx - WICK_W / 2,
        width: WICK_W, height: Math.max(2, wickBottom - wickTop),
        background: color,
      }} />
      {/* Body — overlaps wick */}
      <div style={{
        position: "absolute",
        top: bodyTop, left: cx - CANDLE_W / 2,
        width: CANDLE_W, height: Math.max(2, bodyBottom - bodyTop),
        background: bodyBg,
        borderRadius: 1,
      }} />
    </div>
  );
}

/* ── main component ── */
export default function DataLayer() {
  const [candles, setCandles]       = useState({});
  const [ohlc, setOhlc]             = useState({});
  const [status, setStatus]         = useState("disconnected");
  const [loadingHistory, setLoading] = useState(true);
  const [ticker, setTicker]         = useState("ES=F");
  const [timeframe, setTimeframe]   = useState("5m");
  const wsRef   = useRef(null);
  const gridRef = useRef(null);

  // Auto-scroll to latest candle whenever data loads
  useEffect(() => {
    if (gridRef.current && buckets.length > 0) {
      gridRef.current.scrollLeft = gridRef.current.scrollWidth;
    }
  }, [buckets.length]);

  /* fetch Yahoo Finance history */
  const fetchHistory = useCallback(async (sym, tf) => {
    setLoading(true);
    try {
      const interval = tf === "1m" ? "1m" : tf === "5m" ? "5m" : tf === "15m" ? "15m" : "30m";
      const range    = tf === "1m" ? "1d" : tf === "5m" ? "5d" : tf === "15m" ? "10d" : "30d";
      const res      = await base44.functions.invoke("fetchYahooHistory", { symbol: sym, interval, range });
      const result   = res.data?.chart?.result?.[0];
      if (!result) return;

      const ts = result.timestamp;
      const q  = result.indicators.quote[0];
      const newOhlc = {}, newCandles = {};

      ts.forEach((t, i) => {
        if (!q.open[i] || !q.close[i]) return;
        const bucket = new Date(t * 1000).toISOString().slice(0, 16);
        const bar = {
          time:  t,
          open:  tp(q.open[i]),
          high:  tp(q.high[i]),
          low:   tp(q.low[i]),
          close: tp(q.close[i]),
        };
        newOhlc[bucket]    = bar;
        newCandles[bucket] = distributeVolume(bar.open, bar.high, bar.low, bar.close, q.volume[i] || 0, t);
      });

      setOhlc(newOhlc);
      setCandles(newCandles);
    } catch (e) {
      console.error("fetchHistory", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchHistory(ticker, timeframe), 300);
    return () => clearTimeout(t);
  }, [ticker, timeframe, fetchHistory]);

  /* WebSocket live feed */
  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onopen  = () => setStatus("connected");
    ws.onerror = () => setStatus("error");
    ws.onclose = () => setStatus("disconnected");
    ws.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        if (d.type !== "trade") return;
        const ts  = new Date(d.timestamp);
        const bkt = ts.toISOString().slice(0, 16);
        const pl  = tp(rnd(d.price));
        const t   = Math.floor(ts.getTime() / 60000) * 60;

        setCandles((prev) => {
          const c = { ...prev };
          if (!c[bkt])     c[bkt]     = {};
          if (!c[bkt][pl]) c[bkt][pl] = { b: 0, a: 0 };
          c[bkt][pl].b += d.bid_volume || 0;
          c[bkt][pl].a += d.ask_volume || 0;
          return c;
        });

        setOhlc((prev) => {
          const o = { ...prev };
          if (!o[bkt]) o[bkt] = { time: t, open: d.price, high: d.price, low: d.price, close: d.price };
          o[bkt].high  = Math.max(o[bkt].high, d.price);
          o[bkt].low   = Math.min(o[bkt].low,  d.price);
          o[bkt].close = d.price;
          return o;
        });
      } catch {}
    };
    return () => ws.close();
  }, []);

  /* derived */
  const buckets = useMemo(() => Object.keys(candles).sort().slice(-MAX_CANDLES), [candles]);

  const allPrices = useMemo(() => {
    const ps = new Set();
    buckets.forEach((b) => Object.keys(candles[b]).forEach((p) => ps.add(parseFloat(p))));
    const sorted = Array.from(ps).sort((a, b) => b - a);
    if (sorted.length <= MAX_ROWS) return sorted;
    // Cap to MAX_ROWS levels centered on the most recent candle's midpoint
    const lastBucket = buckets[buckets.length - 1];
    const lastBar = ohlc[lastBucket];
    const centerP = lastBar ? (lastBar.high + lastBar.low) / 2 : sorted[Math.floor(sorted.length / 2)];
    const ci = sorted.findIndex((p) => p <= centerP);
    const start = Math.max(0, Math.min(ci - Math.floor(MAX_ROWS / 2), sorted.length - MAX_ROWS));
    return sorted.slice(start, start + MAX_ROWS);
  }, [buckets, candles, ohlc]);

  const volProfile = useMemo(() => {
    const vp = {};
    buckets.forEach((b) => Object.entries(candles[b] || {}).forEach(([p, v]) => {
      vp[p] = (vp[p] || 0) + v.b + v.a;
    }));
    return vp;
  }, [buckets, candles]);

  const maxVol = useMemo(() => Math.max(...Object.values(volProfile), 1), [volProfile]);

  const summaryData = useMemo(() => {
    let cumDelta = 0, cumVol = 0;
    return buckets.map((bucket) => {
      let ask = 0, bid = 0;
      Object.values(candles[bucket] || {}).forEach((c) => { ask += c.a; bid += c.b; });
      const delta = ask - bid;
      const vol   = ask + bid;
      cumDelta += delta; cumVol += vol;
      return { ask, bid, delta, cumDelta, vol, cumVol };
    });
  }, [buckets, candles]);

  const tickerLabel = ticker.replace("=F", "");

  /* ── render ── */
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e0e0e0", fontFamily: "monospace", paddingLeft: "4rem" }}>
      <MainNav />

      {/* ── header ── */}
      <div style={{ borderBottom: "1px solid #1e1e2e", background: "#0f0f1a", padding: "10px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 15, fontFamily: "sans-serif", color: "#fff" }}>
          {tickerLabel} · Order Flow
        </span>

        <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
          {["1m", "5m", "15m", "30m"].map((tf) => (
            <button key={tf} onClick={() => setTimeframe(tf)} style={{
              background: timeframe === tf ? "#1e3a5f" : "transparent",
              border: "1px solid #1e1e2e", borderRadius: 4,
              color: timeframe === tf ? "#60a5fa" : "#555",
              padding: "2px 10px", fontSize: 11, cursor: "pointer", fontFamily: "sans-serif",
            }}>{tf}</button>
          ))}
        </div>

        <select value={ticker} onChange={(e) => setTicker(e.target.value)} style={{
          background: "#111827", border: "1px solid #1e1e2e", color: "#aaa",
          borderRadius: 4, padding: "2px 8px", fontSize: 11, fontFamily: "sans-serif", cursor: "pointer",
        }}>
          <option value="ES=F">ES Futures</option>
          <option value="NQ=F">NQ Futures</option>
          <option value="CL=F">CL Futures</option>
          <option value="GC=F">GC Futures</option>
        </select>

        <Button variant="ghost" size="icon" onClick={() => fetchHistory(ticker, timeframe)} style={{ color: "#555" }}>
          <RefreshCw size={14} />
        </Button>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, fontSize: 12, fontFamily: "sans-serif" }}>
          {loadingHistory && <span style={{ color: "#f59e0b", fontSize: 11 }}>Loading…</span>}
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: status === "connected" ? "#22c55e" : status === "error" ? "#ef4444" : "#555" }} />
            <span style={{ color: "#666" }}>{status}</span>
          </div>
        </div>
      </div>

      {/* ── chart area ── */}
      {loadingHistory && allPrices.length === 0 ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "calc(100vh - 90px)", color: "#555", fontSize: 14, fontFamily: "sans-serif" }}>
          Loading order flow data…
        </div>
      ) : allPrices.length === 0 ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "calc(100vh - 90px)", color: "#555", fontSize: 14, fontFamily: "sans-serif" }}>
          No data. Try a different ticker or timeframe.
        </div>
      ) : (
        <div ref={gridRef} style={{ overflow: "auto", height: "calc(100vh - 90px)" }}>
          <div style={{ display: "inline-flex", alignItems: "flex-start" }}>

            {/* ── Volume Profile ── sticky left */}
            <div style={{ display: "flex", flexDirection: "column", position: "sticky", left: 0, zIndex: 3, background: "#0a0a0f" }}>
              {allPrices.map((p) => {
                const v = volProfile[p] || 0;
                const w = Math.round((v / maxVol) * (VOL_PROFILE_W - 4));
                const isPOC = v === maxVol;
                return (
                  <div key={p} style={{ height: CELL_H, width: VOL_PROFILE_W, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 3 }}>
                    <div style={{ height: CELL_H - 6, width: w, background: isPOC ? "#7c3aed" : "#1d4e89", borderRadius: 1, opacity: 0.85 }} />
                  </div>
                );
              })}
              {SUMMARY_LABELS.map((label) => (
                <div key={label} style={{
                  height: SUMMARY_H, width: VOL_PROFILE_W,
                  display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 5,
                  fontSize: 9, fontFamily: "sans-serif", fontWeight: 700,
                  color: label === "Ask" ? "#4ade80" : label === "Bid" ? "#f87171" : label === "Delta" || label === "Cum.Δ" ? "#60a5fa" : "#555",
                  borderTop: label === "Ask" ? "2px solid #1e1e2e" : "1px solid #111",
                }}>
                  {label}
                </div>
              ))}
              <div style={{ height: 22, width: VOL_PROFILE_W }} />
            </div>

            {/* ── Price Axis ── sticky */}
            <div style={{ display: "flex", flexDirection: "column", position: "sticky", left: VOL_PROFILE_W, zIndex: 3, background: "#0a0a0f", borderRight: "1px solid #1e1e2e", minWidth: PRICE_AXIS_W }}>
              {allPrices.map((p) => {
                const isPOC = (volProfile[p] || 0) === maxVol;
                return (
                  <div key={p} style={{
                    height: CELL_H, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6,
                    fontSize: 10, color: isPOC ? "#f59e0b" : "#3a3a5a", fontWeight: isPOC ? 700 : 400,
                  }}>
                    {p.toFixed(2)}
                  </div>
                );
              })}
              {SUMMARY_LABELS.map((label) => (
                <div key={label} style={{ height: SUMMARY_H, borderTop: label === "Ask" ? "2px solid #1e1e2e" : "1px solid #111" }} />
              ))}
              <div style={{ height: 22 }} />
            </div>

            {/* ── Candle Columns ── */}
            {buckets.map((bucket, bi) => {
              const bar     = ohlc[bucket];
              const summary = summaryData[bi];
              const isLive  = bi === buckets.length - 1;
              const isGreen = bar ? bar.close >= bar.open : true;

              // per-candle rounded prices for cell context
              const openP  = bar ? rnd(bar.open)  : null;
              const closeP = bar ? rnd(bar.close) : null;
              const highP  = bar ? rnd(bar.high)  : null;
              const lowP   = bar ? rnd(bar.low)   : null;
              const bodyTopP    = bar ? (isGreen ? closeP : openP)  : null;
              const bodyBottomP = bar ? (isGreen ? openP  : closeP) : null;

              return (
                <div key={bucket} style={{
                  display: "flex", flexDirection: "column",
                  marginRight: 2, position: "relative",
                  outline: isLive ? "1px solid #1e3a5f" : "none",
                  borderRadius: isLive ? 2 : 0,
                }}>
                  {/* ── Candle stick overlay ── */}
                  <CandleOverlay bar={bar} allPrices={allPrices} />

                  {/* ── Price level cells — only render rows inside candle range ── */}
                  {(() => {
                    if (!bar || highP === null || lowP === null) {
                      // No bar data: render full-height blank spacer
                      return <div style={{ height: allPrices.length * CELL_H, width: CELL_W, background: "#0a0a0f" }} />;
                    }

                    const aboveCount = allPrices.filter((p) => p > highP).length;
                    const belowCount = allPrices.filter((p) => p < lowP).length;
                    const inRange    = allPrices.filter((p) => p >= lowP && p <= highP);
                    const half       = CELL_W / 2;

                    return (
                      <>
                        {/* Empty rows above candle high */}
                        {aboveCount > 0 && (
                          <div style={{ height: aboveCount * CELL_H, width: CELL_W, background: "#0a0a0f", flexShrink: 0 }} />
                        )}

                        {/* Cells within candle high-low range */}
                        {inRange.map((p) => {
                          const cell     = (candles[bucket] || {})[p];
                          const total    = cell ? cell.b + cell.a : 0;
                          const inBody   = p >= (isGreen ? openP : closeP) && p <= (isGreen ? closeP : openP);
                          const isOpenP  = Math.abs(p - openP)  < TICK_SIZE * 0.1;
                          const isCloseP = Math.abs(p - closeP) < TICK_SIZE * 0.1;

                          const borderTop    = (isCloseP && isGreen) || (isOpenP  && !isGreen) ? "2px dashed rgba(251,146,60,0.8)" : "1px solid #111";
                          const borderBottom = (isOpenP  && isGreen) || (isCloseP && !isGreen) ? "2px dashed rgba(251,146,60,0.8)" : "1px solid #111";

                          if (!cell || total === 0) {
                            const bg = inBody
                              ? (isGreen ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.08)")
                              : "rgba(255,255,255,0.015)";
                            return <div key={p} style={{ height: CELL_H, width: CELL_W, background: bg, borderTop, borderBottom, borderLeft: "1px solid #111", borderRight: "1px solid #111", flexShrink: 0 }} />;
                          }

                          const askDom    = cell.a >= cell.b;
                          const ratio     = askDom ? (cell.b > 0 ? cell.a / cell.b : 999) : (cell.a > 0 ? cell.b / cell.a : 999);
                          const imbalance = total > 5 && ratio >= 3;
                          const isPOC     = (volProfile[p] || 0) === maxVol;
                          const intensity = Math.min(Math.max(cell.b, cell.a) / 300, 1);

                          const bg = inBody
                            ? (askDom ? `rgba(22,163,74,${0.12 + intensity * 0.42})` : `rgba(220,38,38,${0.12 + intensity * 0.42})`)
                            : (askDom ? `rgba(22,163,74,${0.02 + intensity * 0.14})` : `rgba(220,38,38,${0.02 + intensity * 0.14})`);

                          const sellColor = imbalance && !askDom ? "#fb923c" : !askDom ? "#fca5a5" : "#4a4a6a";
                          const buyColor  = imbalance &&  askDom ? "#fb923c" :  askDom ? "#86efac" : "#4a4a6a";

                          return (
                            <div key={p} style={{
                              height: CELL_H, width: CELL_W, background: bg, flexShrink: 0,
                              borderTop, borderBottom,
                              borderLeft:  isPOC ? "1px solid rgba(245,158,11,0.3)" : "1px solid #111",
                              borderRight: isPOC ? "1px solid rgba(245,158,11,0.3)" : "1px solid #111",
                              display: "flex", alignItems: "center",
                              position: "relative", zIndex: 3,
                            }}>
                              <span style={{ display: "inline-block", width: half - 5, textAlign: "right",  paddingRight: 8, fontSize: 9, fontWeight: !askDom ? 700 : 400, color: sellColor, lineHeight: 1 }}>
                                {cell.b > 0 ? cell.b : ""}
                              </span>
                              <span style={{ display: "inline-block", width: half - 5, textAlign: "left",   paddingLeft:  8, fontSize: 9, fontWeight:  askDom ? 700 : 400, color: buyColor,  lineHeight: 1 }}>
                                {cell.a > 0 ? cell.a : ""}
                              </span>
                            </div>
                          );
                        })}

                        {/* Empty rows below candle low */}
                        {belowCount > 0 && (
                          <div style={{ height: belowCount * CELL_H, width: CELL_W, background: "#0a0a0f", flexShrink: 0 }} />
                        )}
                      </>
                    );
                  })()}

                  {/* ── Summary rows ── */}
                  {/* Ask */}
                  <div style={{ height: SUMMARY_H, width: CELL_W, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, fontFamily: "sans-serif", background: "rgba(22,163,74,0.07)", borderTop: "2px solid #1e1e2e", color: "#4ade80" }}>
                    {formatNum(summary.ask)}
                  </div>
                  {/* Bid */}
                  <div style={{ height: SUMMARY_H, width: CELL_W, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, fontFamily: "sans-serif", background: "rgba(220,38,38,0.07)", borderTop: "1px solid #111", color: "#f87171" }}>
                    {formatNum(summary.bid)}
                  </div>
                  {/* Delta */}
                  <div style={{ height: SUMMARY_H, width: CELL_W, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, fontFamily: "sans-serif", borderTop: "1px solid #111", background: summary.delta >= 0 ? "rgba(96,165,250,0.07)" : "rgba(244,114,182,0.07)", color: summary.delta >= 0 ? "#60a5fa" : "#f472b6" }}>
                    {summary.delta > 0 ? "+" : ""}{formatNum(summary.delta)}
                  </div>
                  {/* Cum Delta */}
                  <div style={{ height: SUMMARY_H, width: CELL_W, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, fontFamily: "sans-serif", borderTop: "1px solid #111", background: summary.cumDelta >= 0 ? "rgba(96,165,250,0.04)" : "rgba(244,114,182,0.04)", color: summary.cumDelta >= 0 ? "#93c5fd" : "#f9a8d4" }}>
                    {formatNum(summary.cumDelta)}
                  </div>
                  {/* Volume */}
                  <div style={{ height: SUMMARY_H, width: CELL_W, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, fontFamily: "sans-serif", borderTop: "1px solid #111", color: "#555" }}>
                    {formatNum(summary.vol)}
                  </div>
                  {/* Cum Volume */}
                  <div style={{ height: SUMMARY_H, width: CELL_W, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 500, fontFamily: "sans-serif", borderTop: "1px solid #111", color: "#3a3a4a" }}>
                    {formatNum(summary.cumVol)}
                  </div>

                  {/* Time */}
                  <div style={{ height: 22, width: CELL_W, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontFamily: "sans-serif", borderTop: "1px solid #1e1e2e", color: isLive ? "#60a5fa" : "#2a2a3a", fontWeight: isLive ? 700 : 400 }}>
                    {bucket.slice(11, 16)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Legend ── */}
          <div style={{ display: "flex", gap: 16, padding: "10px 16px 14px", paddingLeft: VOL_PROFILE_W + PRICE_AXIS_W + 16, fontSize: 10, color: "#444", fontFamily: "sans-serif", flexWrap: "wrap", position: "sticky", left: 0 }}>
            <span><span style={{ color: "#86efac" }}>■</span> Buy (ask)</span>
            <span><span style={{ color: "#fca5a5" }}>■</span> Sell (bid)</span>
            <span><span style={{ color: "#fb923c" }}>■</span> Imbalance ≥3:1</span>
            <span><span style={{ color: "#7c3aed" }}>■</span> POC</span>
            <span><span style={{ color: "rgba(251,146,60,0.8)", border: "1px dashed rgba(251,146,60,0.8)", padding: "0 3px" }}>--</span> Open/Close</span>
            <span><span style={{ color: "#22c55e" }}>│</span> Candle (green)</span>
            <span><span style={{ color: "#ef4444" }}>│</span> Candle (red)</span>
          </div>
        </div>
      )}
    </div>
  );
}
