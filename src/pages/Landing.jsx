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

    // Generate spiky volume-like points growing upward from bottom
    const points = [];
    const segments = 200;
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * W;
      // Combine multiple frequencies for irregular spiky shape
      const noise =
        Math.abs(Math.sin(i * 0.3)) * 50 +
        Math.abs(Math.sin(i * 0.7 + 1)) * 30 +
        Math.abs(Math.sin(i * 1.5 + 2)) * 20 +
        Math.abs(Math.sin(i * 0.15)) * 40 +
        Math.abs(Math.sin(i * 2.3 + 0.5)) * 15;
      // y from bottom
      const y = H - noise * 0.75;
      points.push({ x, y });
    }

    // Fill area (upward from baseline)
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, "rgba(255,255,255,0.95)");
    gradient.addColorStop(0.4, "rgba(200,200,200,0.85)");
    gradient.addColorStop(1, "rgba(100,100,100,0.6)");
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

          {/* Right — Chart image */}
          <div className="flex justify-center lg:justify-end">
            <div style={{ transform: "perspective(1000px) rotateY(-8deg) rotateX(3deg)" }}>
              <img
                src="https://media.base44.com/images/public/69a877fa3c3927b616239696/b685c0b06_image.png"
                alt="Datrena Terminal"
                className="rounded-xl shadow-2xl"
                style={{ width: 520 }}
              />
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