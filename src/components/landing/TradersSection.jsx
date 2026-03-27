import React, { useState } from "react";

const TABS = ["Data layer", "Analysis Layer", "Insight Layer", "Validation Layer"];

const TAB_CONTENT = {
  "Data layer": {
    features: [
      "Individual Order Visibility",
      "Queue Position Tracking",
      "Order Lifecycle Transparency",
      "Attributed Order IDs",
      "Hidden Liquidity Detection",
      "Granular Backtesting",
      "Candlestick Chart",
    ],
    description: "Level 3 is the most granular data feed available. It provides a real-time, unfiltered view of every individual order in the exchange's matching engine.",
    featureTitle: "Level 3 Order Data",
    featureDescription: "Provides an unfiltered view of the exchange matching engine, displaying every single buy and sell order separately rather than grouping them by price. This allows traders to distinguish between a single large institutional order and a cluster of smaller retail orders.",
    image: "https://media.base44.com/images/public/69a877fa3c3927b616239696/3a9979a97_image.png",
  },
  "Analysis Layer": {
    features: [
      "Volatility Charting",
      "Combinatorics",
      "Data Analysis",
    ],
    description: "The Analysis Layer provides Artificial Intelligence with access to OHLCVD market data to perform automated statistical analytical tasks.",
    featureTitle: "Volatility Charting",
    featureDescription: "Visualize volatility across time and price to identify regime shifts, mean-reversion opportunities, and trend continuation setups in real time.",
    image: "https://media.base44.com/images/public/69a877fa3c3927b616239696/3a9979a97_image.png",
  },
  "Insight Layer": {
    features: [
      "P&L Tracking",
      "Win Rate Analytics",
      "Max Drawdown",
      "Trade Calendar Heatmap",
      "Prop Firm Integration",
      "Performance Benchmarking",
    ],
    description: "The Insight Layer connects to your prop firm accounts and surfaces performance metrics, trade history, and risk analytics in one unified dashboard.",
    featureTitle: "Prop Firm Integration",
    featureDescription: "Connect directly to supported prop firms and automatically sync your trade history, account balances, and performance metrics without manual data entry.",
    image: "https://media.base44.com/images/public/69a877fa3c3927b616239696/3a9979a97_image.png",
  },
  "Validation Layer": {
    features: [
      "Strategy Backtesting",
      "Walk-Forward Analysis",
      "Monte Carlo Simulation",
      "Risk-Adjusted Metrics",
      "Parameter Optimization",
      "Out-of-Sample Testing",
    ],
    description: "The Validation Layer lets you rigorously test and validate trading strategies with historical data, walk-forward analysis, and statistical robustness checks.",
    featureTitle: "Walk-Forward Analysis",
    featureDescription: "Avoid overfitting by continuously re-optimizing your strategy on rolling windows and testing on unseen data, ensuring your edge holds up across different market regimes.",
    image: "https://media.base44.com/images/public/69a877fa3c3927b616239696/3a9979a97_image.png",
  },
};

const EXCHANGES = [
  { label: "CME: Includes ES (S&P 500), NQ (Nasdaq 100), and Currencies (6E, 6B)." },
  { label: "CBOT: Includes YM (Dow), ZB/ZN (Bonds/Notes), and Grains." },
  { label: "NYMEX: Includes CL (Crude Oil) and Natural Gas." },
  { label: "COMEX: Includes GC (Gold) and SI Silver." },
];

export default function TradersSection({ onSignIn }) {
  const [activeTab, setActiveTab] = useState("Data layer");
  const content = TAB_CONTENT[activeTab];

  return (
    <div className="bg-black px-10 py-16 border-t border-gray-800">
      {/* Top row */}
      <div className="flex gap-12 mb-10">
        {/* Left */}
        <div className="w-1/2">
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-6">
            Datrena is<br />created by<br />traders for<br />traders
          </h2>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  activeTab === tab
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-gray-300 border-gray-600 hover:border-gray-400"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <p className="text-gray-400 text-sm mb-5 leading-relaxed">{content.description}</p>

          <ul className="space-y-3">
            {content.features.map((f, i) => (
              <li key={i}>
                <button
                  className="text-blue-400 underline text-sm hover:text-blue-300 transition-colors text-left"
                  onClick={onSignIn}
                >
                  {f}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Right */}
        <div className="w-1/2 flex flex-col gap-4">
          <img
            src={content.image}
            alt="Layer preview"
            className="rounded-xl w-full object-cover"
            style={{ maxHeight: 280 }}
          />
          <div>
            <h4 className="text-white font-semibold mb-2">{content.featureTitle}</h4>
            <p className="text-gray-400 text-sm leading-relaxed">{content.featureDescription}</p>
          </div>
        </div>
      </div>

      {/* Exchange grid */}
      <div className="grid grid-cols-2 gap-3 max-w-4xl">
        {EXCHANGES.map((ex, i) => (
          <div key={i} className="bg-gray-900 rounded-2xl px-5 py-4 text-gray-300 text-sm">
            {ex.label}
          </div>
        ))}
      </div>
    </div>
  );
}