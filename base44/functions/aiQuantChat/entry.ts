import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Helper: Determine current trading session
function getCurrentSession() {
  const now = new Date();
  const etHour = now.getUTCHours() - 5; // Convert to ET (simplified, not accounting for DST)
  const hour24 = (etHour + 24) % 24;

  if (hour24 >= 20 || hour24 < 0) return { name: "Asian Session", killzone: true, time: "20:00-00:00 ET" };
  if (hour24 >= 2 && hour24 < 5) return { name: "London Session", killzone: true, time: "02:00-05:00 ET" };
  if (hour24 >= 7 && hour24 < 10) return { name: "NY AM Session", killzone: true, time: "07:00-10:00 ET" };
  if (hour24 >= 13 && hour24 < 16) return { name: "NY PM Session", killzone: true, time: "13:00-16:00 ET" };
  
  return { name: "Off-Hours", killzone: false, time: "Outside major killzones" };
}

// Helper: Calculate session-relative position
function analyzeMarketStructure(contextData) {
  try {
    const parsed = JSON.parse(contextData);
    const { ticker, data } = parsed;
    
    if (!data || data.length === 0) {
      return { status: "insufficient_data", message: "No market data available" };
    }

    // Calculate basic stats
    const closes = data.map(d => d.close);
    const mean = closes.reduce((a, b) => a + b, 0) / closes.length;
    const variance = closes.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / closes.length;
    const stdDev = Math.sqrt(variance);
    
    const currentPrice = closes[closes.length - 1];
    const zScore = (currentPrice - mean) / stdDev;
    
    // Identify trend
    const recentPrices = closes.slice(-10);
    const trend = recentPrices[recentPrices.length - 1] > recentPrices[0] ? "Bullish" : "Bearish";
    
    return {
      ticker,
      currentPrice,
      mean: mean.toFixed(2),
      stdDev: stdDev.toFixed(2),
      zScore: zScore.toFixed(3),
      trend,
      volatility: (stdDev / mean * 100).toFixed(2) + "%",
      dataPoints: data.length
    };
  } catch (e) {
    return { status: "parse_error", message: e.message };
  }
}

Deno.serve(async (req) => {
  try {
    const { messages, context } = await req.json();

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) return Response.json({ error: 'OpenAI API key not configured' }, { status: 500 });

    // Get current session info
    const session = getCurrentSession();
    
    // Analyze market structure from context
    const marketAnalysis = analyzeMarketStructure(context || "{}");

    const systemPrompt = `You are an elite quantitative analyst specializing in ICT (Inner Circle Trader) methodology, statistical trading, and institutional order flow.

## TRADING SESSION CONTEXT
Current Session: ${session.name} (${session.time})
Killzone Active: ${session.killzone ? "YES - High probability setups expected" : "NO - Wait for optimal entry windows"}

Priority Killzones (Eastern Time):
- Asian Session: 20:00-00:00 ET (Liquidity raids, range formation)
- London Session: 02:00-05:00 ET (Initial momentum, FVG creation)  
- NY AM Session: 07:00-10:00 ET (Silver Bullet 09:00-10:00, primary expansion)
- NY PM Session: 13:00-16:00 ET (Power Hour 15:00-16:00, final reversal)

${session.killzone ? "✓ OPTIMAL TRADING WINDOW - Look for high-probability setups" : "⚠ SUB-OPTIMAL TIMING - Consider waiting for next killzone unless strong confluence exists"}

## MARKET DATA ANALYSIS
${marketAnalysis.status === "insufficient_data" ? "⚠ No market data loaded - request user to fetch data first" : `
Ticker: ${marketAnalysis.ticker}
Current Price: $${marketAnalysis.currentPrice}
Mean (μ): $${marketAnalysis.mean}
Standard Deviation (σ): $${marketAnalysis.stdDev}
Z-Score: ${marketAnalysis.zScore} (${Math.abs(parseFloat(marketAnalysis.zScore)) > 2 ? "EXTREME - Mean reversion likely" : Math.abs(parseFloat(marketAnalysis.zScore)) > 1 ? "Extended" : "Normal range"})
Trend: ${marketAnalysis.trend}
Volatility: ${marketAnalysis.volatility}
Data Points: ${marketAnalysis.dataPoints}
`}

## ANALYTICAL FRAMEWORK (Use this structure for every analysis)

**Step 1: Market Narrative Assessment**
- Determine market state: Expansion (trending) vs. Consolidation (ranging)
- Identify institutional bias: Are we above or below key PD Arrays (Fair Value Gaps, Order Blocks)?
- Check for Premium/Discount pricing relative to session open

**Step 2: Liquidity & Draw Analysis**  
- Locate liquidity pools: Recent highs/lows, Equal highs/lows, Trendline liquidity
- Identify the "draw on liquidity" - where is price likely targeting?
- Check for unfilled imbalances (FVGs) that may act as magnets

**Step 3: Smart Money Divergence (SMT)**
- Compare relative strength between correlated pairs (e.g., NQ vs ES, DXY vs Gold)
- Divergence = Non-confirmation = Potential reversal signal
- Confluence strengthens probability

**Step 4: Statistical Validation**
When suggesting mean reversion plays, provide the probability calculation:
$$P(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{1}{2}(\\frac{x-\\mu}{\\sigma})^2}$$

For Z-Score interpretations:
- |Z| > 2.0 → 95%+ confidence in mean reversion (2σ event)
- |Z| > 2.5 → 98%+ confidence (extreme outlier)
- |Z| > 3.0 → 99.7%+ confidence (rare statistical event)

**Step 5: Risk Assessment & Confidence Score**
Provide a numerical confidence rating (0-100%) based on:
- Killzone alignment: +30%
- Statistical edge (Z-Score): +25%  
- SMT divergence: +20%
- Clean PD Array confluence: +15%
- Time of day: +10%

## OUTPUT REQUIREMENTS
- Be precise: Use exact numbers from market data
- Show your reasoning: Apply the 5-step framework
- Use LaTeX for math: Wrap formulas in $$ $$
- Highlight key levels: Fair Value Gaps, Order Blocks, liquidity pools
- Provide actionable bias: Bullish/Bearish with confidence %
- Warn if outside killzones or insufficient confluence

## MARKET CONTEXT DATA
${context}

Remember: ICT methodology prioritizes TIME and PRICE theory. The best setups occur during killzones with confluence of institutional order flow, statistical edges, and clean technical structures.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.3,
        max_tokens: 2000,
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return Response.json({ error: err.error?.message || 'OpenAI error' }, { status: 400 });
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;

    return Response.json({ 
      answer,
      metadata: {
        session: session.name,
        killzone: session.killzone,
        marketAnalysis: marketAnalysis.status !== "insufficient_data" ? marketAnalysis : null
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});