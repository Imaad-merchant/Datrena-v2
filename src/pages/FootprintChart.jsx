import React, { useState, useEffect, useRef } from "react";
import { Activity, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function FootprintChart() {
  const navigate = useNavigate();
  const [trades, setTrades] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const wsRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket("wss://elsa-censureless-joyce.ngrok-free.dev");
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus("connected");
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "trade") {
        setTrades(prev => [...prev.slice(-499), data]); // Keep last 500 trades
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus("error");
    };

    ws.onclose = () => {
      setConnectionStatus("disconnected");
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.close();
    };
  }, []);

  // Group trades into candles by time bucket
  const candleMap = {};
  const candleOHLC = {}; // Track OHLC for candlestick bars
  
  trades.forEach(trade => {
    const timeBucket = new Date(trade.timestamp).toISOString().slice(0, 16); // 1-minute buckets
    if (!candleMap[timeBucket]) {
      candleMap[timeBucket] = { timeBucket, priceLevels: {} };
      candleOHLC[timeBucket] = { 
        open: trade.price, 
        high: trade.price, 
        low: trade.price, 
        close: trade.price 
      };
    }
    
    const priceLevel = Math.round(trade.price * 4) / 4; // Round to 0.25 tick
    if (!candleMap[timeBucket].priceLevels[priceLevel]) {
      candleMap[timeBucket].priceLevels[priceLevel] = { bidVolume: 0, askVolume: 0 };
    }
    
    candleMap[timeBucket].priceLevels[priceLevel].bidVolume += trade.bid_volume || 0;
    candleMap[timeBucket].priceLevels[priceLevel].askVolume += trade.ask_volume || 0;
    
    // Update OHLC
    candleOHLC[timeBucket].high = Math.max(candleOHLC[timeBucket].high, trade.price);
    candleOHLC[timeBucket].low = Math.min(candleOHLC[timeBucket].low, trade.price);
    candleOHLC[timeBucket].close = trade.price;
  });

  const candles = Object.values(candleMap).slice(-20); // Show last 20 candles
  
  // Get all unique price levels across all candles
  const allPrices = new Set();
  candles.forEach(candle => {
    Object.keys(candle.priceLevels).forEach(price => allPrices.add(parseFloat(price)));
  });
  const sortedPrices = Array.from(allPrices).sort((a, b) => b - a); // Descending
  
  const minPrice = Math.min(...sortedPrices);
  const maxPrice = Math.max(...sortedPrices);

  // Calculate volume profile (total volume at each price)
  const volumeProfile = {};
  candles.forEach(candle => {
    Object.entries(candle.priceLevels).forEach(([price, vol]) => {
      if (!volumeProfile[price]) volumeProfile[price] = 0;
      volumeProfile[price] += vol.bidVolume + vol.askVolume;
    });
  });
  const maxProfileVolume = Math.max(...Object.values(volumeProfile), 1);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/80 backdrop-blur px-6 py-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl("Terminal"))}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Activity className="w-6 h-6 text-yellow-400" />
        <h1 className="text-xl font-bold tracking-wide text-white">Footprint Chart</h1>
        <div className="ml-auto flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === "connected" ? "bg-green-500" : 
            connectionStatus === "error" ? "bg-red-500" : "bg-gray-500"
          }`} />
          <span className="text-sm text-gray-400 capitalize">{connectionStatus}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 overflow-auto">
        {connectionStatus === "disconnected" && (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-2">Connecting to wss://elsa-censureless-joyce.ngrok-free.dev...</p>
            <p className="text-xs">Waiting for WebSocket connection</p>
          </div>
        )}

        {connectionStatus === "error" && (
          <div className="text-center py-12 text-red-400">
            <p className="mb-2">Connection failed</p>
            <p className="text-xs">Unable to connect to WebSocket server</p>
          </div>
        )}

        {connectionStatus === "connected" && candles.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Connected. Waiting for trade data...</p>
          </div>
        )}

        {connectionStatus === "connected" && candles.length > 0 && (
          <div className="bg-black p-6">
            <div className="flex gap-0">
              {/* Volume Profile */}
              <div className="flex flex-col-reverse gap-0 pr-3 border-r border-gray-800">
                {sortedPrices.map(price => {
                  const vol = volumeProfile[price] || 0;
                  const width = (vol / maxProfileVolume) * 50;
                  const isRed = vol > 0 && volumeProfile[price] > maxProfileVolume * 0.5;
                  return (
                    <div key={price} className="h-6 flex items-center justify-end">
                      <div 
                        className={`h-4 ${isRed ? 'bg-red-600' : 'bg-green-600'}`}
                        style={{ width: `${width}px` }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Price Axis */}
              <div className="flex flex-col-reverse gap-0 pr-3 border-r border-gray-800">
                {sortedPrices.map(price => (
                  <div key={price} className="h-6 flex items-center text-[10px] font-mono text-gray-400 px-2">
                    {price.toFixed(2)}
                  </div>
                ))}
              </div>

              {/* Candle Columns with Candlestick bars on top */}
              <div className="flex gap-0 overflow-x-auto">
                {candles.map((candle, candleIdx) => {
                  const ohlc = candleOHLC[candle.timeBucket];
                  const isGreen = ohlc.close >= ohlc.open;
                  
                  // Calculate cumulative delta and regular delta
                  const cumulativeDelta = Object.values(candle.priceLevels).reduce(
                    (sum, vol) => sum + (vol.askVolume - vol.bidVolume), 0
                  );
                  const totalVolume = Object.values(candle.priceLevels).reduce(
                    (sum, vol) => sum + vol.bidVolume + vol.askVolume, 0
                  );

                  return (
                    <div key={candleIdx} className="flex flex-col gap-0 border-r border-gray-900">
                      {/* Candlestick bar overlay */}
                      <div className="relative h-24 w-16 mb-1 flex items-end justify-center">
                        <div className="absolute inset-0 flex flex-col justify-between px-7">
                          {sortedPrices.map(price => (
                            <div key={price} className="h-px" />
                          ))}
                        </div>
                        
                        {/* Wick and body */}
                        <div className="relative w-full h-full flex flex-col items-center justify-end">
                          <div 
                            className={`absolute w-0.5 ${isGreen ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{
                              bottom: `${((ohlc.low - minPrice) / (maxPrice - minPrice)) * 100}%`,
                              height: `${((ohlc.high - ohlc.low) / (maxPrice - minPrice)) * 100}%`
                            }}
                          />
                          <div 
                            className={`absolute w-3 ${isGreen ? 'bg-green-600' : 'bg-red-600'}`}
                            style={{
                              bottom: `${((Math.min(ohlc.open, ohlc.close) - minPrice) / (maxPrice - minPrice)) * 100}%`,
                              height: `${(Math.abs(ohlc.close - ohlc.open) / (maxPrice - minPrice)) * 100}%`
                            }}
                          />
                        </div>
                      </div>

                      {/* Footprint cells */}
                      <div className="flex flex-col-reverse gap-0">
                        {sortedPrices.map(price => {
                          const cell = candle.priceLevels[price] || { bidVolume: 0, askVolume: 0 };
                          const bid = cell.bidVolume;
                          const ask = cell.askVolume;
                          const total = bid + ask;
                          
                          const isAskDominant = ask > bid;
                          const maxVol = Math.max(bid, ask);
                          const intensity = total > 0 ? Math.min(maxVol / 50, 1) : 0;
                          
                          const hasImbalance = (bid > 0 && ask > 0) && (bid / ask >= 3 || ask / bid >= 3);
                          
                          const bgColor = total === 0 ? '#0a0a0a' :
                            isAskDominant 
                              ? `rgba(22, 163, 74, ${0.15 + intensity * 0.4})` 
                              : `rgba(220, 38, 38, ${0.15 + intensity * 0.4})`;

                          return (
                            <div
                              key={price}
                              className={`h-6 w-16 flex items-center justify-center text-[9px] font-semibold border border-gray-900 ${
                                hasImbalance ? 'ring-1 ring-inset ring-black' : ''
                              }`}
                              style={{ backgroundColor: bgColor }}
                            >
                              {total > 0 && (
                                <span className={isAskDominant ? 'text-green-300' : 'text-red-300'}>
                                  {bid} × {ask}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Delta below candle */}
                      <div className={`h-7 w-16 flex items-center justify-center text-xs font-bold border-t border-gray-800 ${
                        cumulativeDelta > 0 ? 'text-blue-400' : cumulativeDelta < 0 ? 'text-pink-400' : 'text-gray-500'
                      }`}>
                        {cumulativeDelta !== 0 && (cumulativeDelta > 0 ? '+' : '')}{cumulativeDelta}
                      </div>

                      {/* Cumulative Delta */}
                      <div className={`h-7 w-16 flex items-center justify-center text-xs font-bold border-t border-gray-800 ${
                        cumulativeDelta > 0 ? 'text-green-400 bg-green-950/20' : 'text-red-400 bg-red-950/20'
                      }`}>
                        {cumulativeDelta > 0 ? '+' : ''}{cumulativeDelta}
                      </div>

                      {/* Volume */}
                      <div className="h-7 w-16 flex items-center justify-center text-[10px] text-gray-500 border-t border-gray-800">
                        {totalVolume}
                      </div>

                      {/* Time */}
                      <div className="h-6 w-16 flex items-center justify-center text-[9px] text-gray-600 border-t border-gray-900">
                        {new Date(candle.timeBucket).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: false 
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}