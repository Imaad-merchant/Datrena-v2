import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { symbol, days } = await req.json();

    const interval = days <= 7 ? '1h' : days <= 30 ? '1h' : '1d';
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${days}d`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      return Response.json({ error: `Yahoo Finance error: ${response.status}` }, { status: 400 });
    }

    const json = await response.json();
    const result = json?.chart?.result?.[0];

    if (!result) {
      return Response.json({ error: 'No data returned for this symbol' }, { status: 400 });
    }

    const timestamps = result.timestamp;
    const quote = result.indicators.quote[0];
    const { open, high, low, close, volume } = quote;

    const rows = timestamps.map((ts, i) => {
      const date = new Date(ts * 1000);
      return {
        timestamp: ts,
        date: date.toISOString(),
        hour: date.getUTCHours(),
        open: open[i],
        high: high[i],
        low: low[i],
        close: close[i],
        volume: volume[i],
        hl_range: (high[i] != null && low[i] != null) ? high[i] - low[i] : null,
      };
    }).filter(r => r.close != null);

    // London session: 2am-5am UTC
    const londonData = rows.filter(r => r.hour >= 2 && r.hour <= 5);
    const londonCloses = londonData.map(r => r.close).filter(Boolean);
    const lonMean = londonCloses.length > 0 ? londonCloses.reduce((a, b) => a + b, 0) / londonCloses.length : null;
    const lonStd = londonCloses.length > 1
      ? Math.sqrt(londonCloses.reduce((sum, v) => sum + Math.pow(v - lonMean, 2), 0) / (londonCloses.length - 1))
      : null;

    // Hourly volatility
    const hourlyMap = {};
    rows.forEach(r => {
      if (r.hl_range != null) {
        if (!hourlyMap[r.hour]) hourlyMap[r.hour] = [];
        hourlyMap[r.hour].push(r.hl_range);
      }
    });
    const hourlyVol = Object.entries(hourlyMap).map(([hour, vals]) => ({
      hour: parseInt(hour),
      avg_range: vals.reduce((a, b) => a + b, 0) / vals.length,
    })).sort((a, b) => a.hour - b.hour);

    // NY open price (hour 13 UTC = 9am ET)
    const nyRows = rows.filter(r => r.hour === 13);
    const nyOpenPrice = nyRows.length > 0 ? nyRows[nyRows.length - 1].open : null;

    const sdLevels = lonMean && lonStd ? {
      mean: lonMean,
      std: lonStd,
      plus1: lonMean + lonStd,
      plus1_5: lonMean + 1.5 * lonStd,
      plus2: lonMean + 2 * lonStd,
      plus2_5: lonMean + 2.5 * lonStd,
      minus1: lonMean - lonStd,
      minus1_5: lonMean - 1.5 * lonStd,
      minus2: lonMean - 2 * lonStd,
      minus2_5: lonMean - 2.5 * lonStd,
    } : null;

    return Response.json({
      rows,
      sdLevels,
      hourlyVol,
      nyOpenPrice,
      meta: result.meta,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});