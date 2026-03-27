import React, { useState } from "react";

const TABS = ["Data layer", "Analysis Layer", "Insight Layer", "Validation Layer"];

const TAB_CONTENT = {
  "Data layer": {
    description: "Level 3 is the most granular data feed available. It provides a real-time, unfiltered view of every individual order in the exchange's matching engine.",
    features: [
      {
        label: "Individual Order Visibility",
        title: "Individual Order Visibility",
        description: "See every single buy and sell order individually rather than grouped by price. This allows traders to distinguish between a single large institutional order and a cluster of smaller retail orders at the same price level.",
        image: "https://media.base44.com/images/public/69a877fa3c3927b616239696/3a9979a97_image.png",
      },
      {
        label: "Queue Position Tracking",
        title: "Queue Position Tracking",
        description: "Monitor where your orders sit in the exchange queue relative to other participants. Understanding queue position helps traders time entries and exits more precisely in highly competitive markets.",
        image: "https://media.base44.com/images/public/69a877fa3c3927b616239696/3a9979a97_image.png",
      },
      {
        label: "Order Lifecycle Transparency",
        title: "Order Lifecycle Transparency",
        description: "Track the full lifecycle of each order from submission to fill, modification, or cancellation. This visibility exposes market microstructure patterns invisible in standard Level 1 or 2 feeds.",
        image: "https://media.base44.com/images/public/69a877fa3c3927b616239696/3a9979a97_image.png",
      },
      {
        label: "Attributed Order IDs",
        title: "Attributed Order IDs",
        description: "Each order carries a unique ID allowing you to trace specific participants' activity across time. This enables detection of recurring algorithmic patterns and institutional order-routing behavior.",
        image: "https://media.base44.com/images/public/69a877fa3c3927b616239696/3a9979a97_image.png",
      },
      {
        label: "Hidden Liquidity Detection",
        title: "Hidden Liquidity Detection",
        description: "Identify iceberg orders and dark pool activity that never appear in the standard order book. Detecting hidden liquidity gives traders an edge when anticipating large directional moves.",
        image: "https://media.base44.com/images/public/69a877fa3c3927b616239696/3a9979a97_image.png",
      },
      {
        label: "Granular Backtesting",
        title: "Granular Backtesting",
        description: "Run strategies against tick-level historical data, capturing every order event instead of aggregated bars. This produces significantly more accurate performance estimates for high-frequency and microstructure-based systems.",
        image: "https://media.base44.com/images/public/69a877fa3c3927b616239696/3a9979a97_image.png",
      },
      {
        label: "Candlestick Chart",
        title: "Candlestick Chart",
        description: "View price action rendered as traditional OHLC candlesticks across multiple timeframes. Combined with order flow data, candlestick charts reveal the context behind each price move.",
        image: "https://media.base44.com/images/public/69a877fa3c3927b616239696/ea49b83e1_Screenshot2026-03-19at55922PM.png",
      },
    ],
  },
  "Analysis Layer": {
    description: "The Analysis Layer provides Artificial Intelligence with access to OHLCVD market data to perform automated statistical analytical tasks.",
    features: [
      {
        label: "Volatility Charting",
        title: "Volatility Charting",
        description: "Visualize volatility across time and price to identify regime shifts, mean-reversion opportunities, and trend continuation setups in real time.",
        image: "https://media.base44.com/images/public/69a877fa3c3927b616239696/3a9979a97_image.png",
      },
      {
        label: "Combinatorics",
        title: "Combinatorics",
        description: "Apply combinatorial analysis to discover statistically significant sequences of market events. This approach uncovers non-obvious edge patterns that are invisible to traditional indicator-based analysis.",
        image: "https://media.base44.com/images/public/69a877fa3c3927b616239696/3a9979a97_image.png",
      },
      {
        label: "Data Analysis",
        title: "Data Analysis",
        description: "Run deep quantitative analysis powered by AI on OHLCVD market data. Surface correlations, distributions, and behavioral patterns across multiple instruments and timeframes simultaneously.",
        image: "https://media.base44.com/images/public/69a877fa3c3927b616239696/3a9979a97_image.png",
      },
    ],
  },
  "Insight Layer": {
    description: "The Insight Layer connects to your prop firm accounts and surfaces performance metrics, trade history, and risk analytics in one unified dashboard.",
    features: [
      {
        label: "P&L Tracking",
        title: "P&L Tracking",
        description: "Monitor your realized and unrealized profit and loss across all connected accounts in real time. Drill down by session, symbol, or date range to understand exactly where your edge is performing.",
        image: "https://media.base44.com/images/public/69a877fa3c3927b616239696/3a9979a97_image.png",
      },
      {
        label: "Win Rate Analytics",
        title: "Win Rate Analytics",
        description: "Track your win rate, average winner vs. average loser, and expectancy across all trades. Understand how these metrics evolve over time and under different market conditions.",
        image: "https://media.base44.com/images/public/69a877fa3c3927b616239696/3a9979a97_image.png",
      },
      {
        label: "Max Drawdown",
        title: "Max Drawdown",
        description: "Monitor your maximum peak-to-trough decline in real time to stay within prop firm risk limits. Visualize drawdown curves to identify periods of strategy underperformance before they escalate.",
        image: "https://media.base44.com/images/public/69a877fa3c3927b616239696/3a9979a97_image.png",
      },
      {
        label: "Trade Calendar Heatmap",
        title: "Trade Calendar Heatmap",
        description: "See your daily P&L displayed as a color-coded calendar heatmap. Instantly spot patterns in your performance across days of the week, months, and market sessions.",
        image: "https://media.base44.com/images/public/69a877fa3c3927b616239696/3a9979a97_image.png",
      },
      {
        label: "Prop Firm Integration",
        title: "Prop Firm Integration",
        description: "Connect directly to supported prop firms and automatically sync your trade history, account balances, and performance metrics without manual data entry.",
        image: "https://media.base44.com/images/public/69a877fa3c3927b616239696/3a9979a97_image.png",
      },
      {
        label: "Performance Benchmarking",
        title: "Performance Benchmarking",
        description: "Compare your trading performance against community benchmarks and top-ranked strategies. Understand how your risk-adjusted returns stack up against other traders on the platform.",
        image: "https://media.base44.com/images/public/69a877fa3c3927b616239696/3a9979a97_image.png",
      },
    ],
  },
  "Validation Layer": {
    description: "The Validation Layer lets you rigorously test and validate trading strategies with historical data, walk-forward analysis, and statistical robustness checks.",
    features: [
      {
        label: "Strategy Backtesting",
        title: "Strategy Backtesting",
        description: "Test your trading strategies against years of historical data with precise tick-level accuracy. Evaluate performance across different market regimes, sessions, and instrument types.",
        image: "https://media.base44.com/images/public/69a877fa3c3927b616239696/3a9979a97_image.png",
      },
      {
        label: "Walk-Forward Analysis",
        title: "Walk-Forward Analysis",
        description: "Avoid overfitting by continuously re-optimizing your strategy on rolling windows and testing on unseen data, ensuring your edge holds up across different market regimes.",
        image: "https://media.base44.com/images/public/69a877fa3c3927b616239696/3a9979a97_image.png",
      },
      {
        label: "Monte Carlo Simulation",
        title: "Monte Carlo Simulation",
        description: "Run thousands of simulated trade sequences to understand the probability distribution of your strategy's outcomes. Quantify worst-case drawdown scenarios before risking real capital.",
        image: "https://media.base44.com/images/public/69a877fa3c3927b616239696/3a9979a97_image.png",
      },
      {
        label: "Risk-Adjusted Metrics",
        title: "Risk-Adjusted Metrics",
        description: "Evaluate your strategy using Sharpe ratio, Sortino ratio, Calmar ratio, and other industry-standard risk-adjusted performance measures beyond simple win rate or P&L.",
        image: "https://media.base44.com/images/public/69a877fa3c3927b616239696/3a9979a97_image.png",
      },
      {
        label: "Parameter Optimization",
        title: "Parameter Optimization",
        description: "Systematically search for optimal strategy parameters using grid search and genetic algorithms. Visualize parameter sensitivity surfaces to identify robust configurations.",
        image: "https://media.base44.com/images/public/69a877fa3c3927b616239696/3a9979a97_image.png",
      },
      {
        label: "Out-of-Sample Testing",
        title: "Out-of-Sample Testing",
        description: "Reserve a portion of your data exclusively for final validation, never touched during optimization. This provides an honest, unbiased estimate of how your strategy will perform in live markets.",
        image: "https://media.base44.com/images/public/69a877fa3c3927b616239696/3a9979a97_image.png",
      },
    ],
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
  const [activeFeature, setActiveFeature] = useState(0);
  const content = TAB_CONTENT[activeTab];
  const selectedFeature = content.features[activeFeature] || content.features[0];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setActiveFeature(0);
  };

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
                onClick={() => handleTabChange(tab)}
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
                  className={`text-sm transition-colors text-left ${activeFeature === i ? 'text-white font-semibold' : 'text-blue-400 underline hover:text-blue-300'}`}
                  onClick={() => setActiveFeature(i)}
                >
                  {f.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Right */}
        <div className="w-1/2 flex flex-col gap-4">
          <img
            src={selectedFeature.image}
            alt={selectedFeature.title}
            className="rounded-xl w-full object-cover"
            style={{ maxHeight: 280 }}
          />
          <div>
            <h4 className="text-white font-semibold mb-2">{selectedFeature.title}</h4>
            <p className="text-gray-400 text-sm leading-relaxed">{selectedFeature.description}</p>
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