import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Check, X, Zap, Shield, Crown, Activity, ArrowLeft } from "lucide-react";

const PLANS = [
  {
    name: "Basic",
    price: 10,
    icon: Zap,
    color: "text-blue-400",
    border: "border-gray-700",
    badge: null,
    description: "Get started with essential market tools.",
    features: [
      { label: "Level 1 Market Data", included: true },
      { label: "Basic Candlestick Charts", included: true },
      { label: "5 Backtests / month", included: true },
      { label: "DataLayer access", included: true },
      { label: "Community strategy browser", included: true },
      { label: "Level 2 Order Book Data", included: false },
      { label: "AI Quant Chat", included: false },
      { label: "Volatility Heatmaps", included: false },
      { label: "Footprint / Order Flow Charts", included: false },
      { label: "Prop Firm Integration", included: false },
      { label: "Level 3 Institutional Data", included: false },
      { label: "Unlimited Strategy Publishing", included: false },
    ],
  },
  {
    name: "Advanced",
    price: 20,
    icon: Shield,
    color: "text-purple-400",
    border: "border-purple-500",
    badge: "Most Popular",
    description: "Full analytical suite for active traders.",
    features: [
      { label: "Level 1 Market Data", included: true },
      { label: "Basic Candlestick Charts", included: true },
      { label: "Unlimited Backtests", included: true },
      { label: "DataLayer access", included: true },
      { label: "Community strategy browser", included: true },
      { label: "Level 2 Order Book Data", included: true },
      { label: "AI Quant Chat", included: true },
      { label: "Volatility Heatmaps", included: true },
      { label: "Footprint / Order Flow Charts", included: true },
      { label: "Prop Firm Integration", included: false },
      { label: "Level 3 Institutional Data", included: false },
      { label: "Unlimited Strategy Publishing", included: false },
    ],
  },
  {
    name: "Pro",
    price: 40,
    icon: Crown,
    color: "text-yellow-400",
    border: "border-yellow-500",
    badge: "Full Access",
    description: "Institutional-grade tools for serious quants.",
    features: [
      { label: "Level 1 Market Data", included: true },
      { label: "Basic Candlestick Charts", included: true },
      { label: "Unlimited Backtests", included: true },
      { label: "DataLayer access", included: true },
      { label: "Community strategy browser", included: true },
      { label: "Level 2 Order Book Data", included: true },
      { label: "AI Quant Chat", included: true },
      { label: "Volatility Heatmaps", included: true },
      { label: "Footprint / Order Flow Charts", included: true },
      { label: "Prop Firm Integration", included: true },
      { label: "Level 3 Institutional Data", included: true },
      { label: "Unlimited Strategy Publishing", included: true },
    ],
  },
];

export default function Pricing() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="bg-black min-h-screen text-white">
      <nav className="flex items-center justify-between px-10 py-5 border-b border-gray-900">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-white" />
          <span className="text-white text-lg font-bold tracking-wide">Datrena</span>
        </div>
        <Link to="/" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </nav>
      <div className="px-10 py-12 max-w-6xl mx-auto">

        <div className="mb-10">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Subscription</p>
          <h1 className="text-2xl font-bold text-white">Choose Your Plan</h1>
          <p className="text-sm text-gray-500 mt-1">Unlock more data depth and analytical power as you level up.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selected === plan.name;
            return (
              <div
                key={plan.name}
                className={`relative bg-gray-900 border rounded-2xl p-6 flex flex-col transition-all ${plan.border} ${isSelected ? "ring-2 ring-offset-2 ring-offset-gray-950 ring-white/20" : ""}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-gray-800 border ${plan.border} ${plan.color}`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${plan.color}`} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">{plan.name}</h2>
                    <p className="text-xs text-gray-500">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  <span className="text-sm text-gray-500">/mo</span>
                </div>

                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      {f.included
                        ? <Check className="w-4 h-4 text-green-400 shrink-0" />
                        : <X className="w-4 h-4 text-gray-700 shrink-0" />}
                      <span className={f.included ? "text-gray-300" : "text-gray-600"}>{f.label}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setSelected(plan.name)}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                    isSelected
                      ? `bg-white text-gray-950 border-white`
                      : `bg-transparent ${plan.color} ${plan.border} hover:bg-gray-800`
                  }`}
                >
                  {isSelected ? "Selected" : `Get ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-600 mt-8 text-center">All plans billed monthly. Cancel anytime. Data access subject to exchange fees.</p>
      </div>
    </div>
  );
}