import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Activity } from "lucide-react";

export default function Landing() {
  const canvasRef = useRef(null);

  const handleSignIn = () => {
    base44.auth.redirectToLogin(createPageUrl("QuantHome"));
  };

  // Draw wave/mountain silhouette on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Generate mountain-like wave points
    const points = [];
    const segments = 120;
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * W;
      const noise =
        Math.sin(i * 0.18) * 40 +
        Math.sin(i * 0.07) * 60 +
        Math.sin(i * 0.34) * 20 +
        Math.sin(i * 0.55) * 15;
      const y = H * 0.55 - noise;
      points.push({ x, y });
    }

    // Fill area below the wave
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, "rgba(200,200,200,0.9)");
    gradient.addColorStop(1, "rgba(80,80,80,0.6)");
    ctx.fillStyle = gradient;
    ctx.fill();
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 z-10">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-white" />
          <span className="text-white text-xl font-bold tracking-wide">Datrena</span>
        </div>
        <div className="flex items-center gap-10">
          <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">Pricing</a>
          <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">Features</a>
          <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">Forge Labs</a>
          <button
            onClick={handleSignIn}
            className="text-white text-sm font-medium hover:text-gray-300 transition-colors ml-4"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 relative flex items-center">
        <div className="max-w-7xl mx-auto px-8 w-full grid lg:grid-cols-2 gap-8 items-center py-16">
          {/* Left */}
          <div>
            <h1 className="text-5xl font-bold text-white leading-tight mb-6">
              Quantitative Research<br />Meets Analytics
            </h1>
            <p className="text-gray-400 text-base leading-relaxed max-w-sm">
              A Professional Quantitative Trading Platform<br />
              for Orderflow, Strategy Research, and Backtesting.
            </p>
          </div>

          {/* Right — Chart mockup */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative" style={{ transform: "perspective(1000px) rotateY(-8deg) rotateX(3deg)" }}>
              {/* Monitor */}
              <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-700" style={{ width: 480 }}>
                {/* Title bar */}
                <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div className="flex-1 mx-4 bg-gray-700 rounded h-4 text-xs text-gray-400 flex items-center px-2 truncate">
                    datrena.app / terminal
                  </div>
                </div>
                {/* Chart area */}
                <div className="bg-black p-2 h-64 relative overflow-hidden">
                  {/* Simulated footprint/candlestick chart */}
                  <div className="absolute inset-0 flex items-end justify-around px-2 pb-2 gap-0.5">
                    {[
                      { h: 60, up: false }, { h: 80, up: true }, { h: 55, up: false },
                      { h: 90, up: true }, { h: 70, up: false }, { h: 100, up: true },
                      { h: 85, up: false }, { h: 110, up: true }, { h: 75, up: false },
                      { h: 95, up: true }, { h: 65, up: false }, { h: 120, up: true },
                      { h: 88, up: false }, { h: 78, up: true }, { h: 50, up: false },
                      { h: 92, up: true }, { h: 68, up: false }, { h: 105, up: true },
                      { h: 82, up: false }, { h: 115, up: true },
                    ].map((bar, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{
                          height: bar.h,
                          backgroundColor: bar.up ? "#22c55e" : "#ef4444",
                          opacity: 0.85,
                          minWidth: 10,
                        }}
                      />
                    ))}
                  </div>
                  {/* Yellow horizontal line */}
                  <div className="absolute left-0 right-0" style={{ top: "30%", height: 2, backgroundColor: "#ca8a04", opacity: 0.8 }} />
                  {/* White line overlay */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 480 256" preserveAspectRatio="none">
                    <polyline
                      points="0,180 60,160 120,170 180,140 240,150 300,120 360,130 420,100 480,110"
                      fill="none"
                      stroke="white"
                      strokeWidth="1.5"
                      opacity="0.6"
                    />
                  </svg>
                </div>
                {/* Bottom bar */}
                <div className="bg-gray-900 px-4 py-1 border-t border-gray-700 flex gap-4">
                  <div className="h-3 w-16 bg-blue-500 rounded-full opacity-80" />
                  <div className="h-3 w-24 bg-gray-700 rounded-full" />
                  <div className="h-3 w-12 bg-gray-700 rounded-full" />
                </div>
              </div>
              {/* Stand */}
              <div className="mx-auto w-20 h-3 bg-gray-600 rounded-b-sm" />
              <div className="mx-auto w-32 h-1.5 bg-gray-700 rounded-sm" />
            </div>
          </div>
        </div>

        {/* Wave silhouette */}
        <div className="absolute bottom-0 left-0 right-0">
          <canvas ref={canvasRef} width={1400} height={180} className="w-full" />
        </div>
      </div>
    </div>
  );
}