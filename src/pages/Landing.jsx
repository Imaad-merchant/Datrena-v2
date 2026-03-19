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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Generate volume-like spiky waveform growing UP from bottom
    const points = [];
    const segments = 300;

    // Seed a deterministic volume profile with clusters of activity
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      // Multiple overlapping sine waves for organic volume shape
      const base =
        Math.pow(Math.abs(Math.sin(i * 0.08)), 0.5) * 80 +
        Math.pow(Math.abs(Math.sin(i * 0.22 + 1.2)), 0.6) * 60 +
        Math.abs(Math.sin(i * 0.55 + 0.4)) * 35 +
        Math.abs(Math.sin(i * 1.1 + 2.1)) * 25 +
        Math.abs(Math.sin(i * 2.4 + 0.8)) * 15 +
        Math.abs(Math.sin(i * 4.2 + 1.5)) * 10;

      // Add a few big volume spikes
      let spike = 0;
      if (i > 10 && i < 18) spike = 60 * Math.sin(((i - 10) / 8) * Math.PI);
      if (i > 55 && i < 68) spike = 80 * Math.sin(((i - 55) / 13) * Math.PI);
      if (i > 120 && i < 135) spike = 70 * Math.sin(((i - 120) / 15) * Math.PI);
      if (i > 195 && i < 210) spike = 90 * Math.sin(((i - 195) / 15) * Math.PI);
      if (i > 260 && i < 275) spike = 75 * Math.sin(((i - 260) / 15) * Math.PI);

      const height = base + spike;
      const y = H - Math.max(height, 4);
      points.push({ x: (i / segments) * W, y });
    }

    // Draw filled area
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.25, "rgba(220,220,220,0.95)");
    gradient.addColorStop(0.6, "rgba(130,130,130,0.85)");
    gradient.addColorStop(1, "rgba(40,40,40,0.7)");
    ctx.fillStyle = gradient;
    ctx.fill();
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col overflow-hidden">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-5 z-10 relative">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-white" />
          <span className="text-white text-lg font-bold tracking-wide">Datrena</span>
        </div>
        <div className="flex items-center gap-10">
          <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">Pricing</a>
          <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">Features</a>
          <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">Forge Labs</a>
          <button
            onClick={handleSignIn}
            className="text-white text-sm font-semibold hover:text-gray-300 transition-colors ml-4"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 relative flex flex-col">
        {/* Content row */}
        <div className="flex items-start justify-between px-10 pt-10 pb-4 z-10 relative">
          {/* Left text */}
          <div className="max-w-sm mt-6">
            <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Quantitative Research<br />Meets Analytics
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              A Professional Quantitative Trading Platform<br />
              for Orderflow, Strategy Research, and Backtesting.
            </p>
          </div>

          {/* Right — monitor image */}
          <div className="flex-shrink-0 -mt-2 mr-4">
            <img
              src="https://media.base44.com/images/public/69a877fa3c3927b616239696/ea49b83e1_Screenshot2026-03-19at55922PM.png"
              alt="Datrena Terminal"
              className="rounded-xl shadow-2xl"
              style={{ width: 560 }}
            />
          </div>
        </div>

        {/* Volume wave — positioned at bottom, tall */}
        <div className="absolute bottom-0 left-0 right-0">
          <canvas ref={canvasRef} width={1600} height={240} className="w-full block" />
        </div>

        {/* Spacer to push content above wave */}
        <div style={{ height: 200 }} />
      </div>
    </div>
  );
}