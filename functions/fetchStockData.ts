import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Map our timeframe labels to Yahoo Finance interval/range combos
const TF_MAP = {
  '1m':   { interval: '1m',  range: '1d' },
  '2m':   { interval: '2m',  range: '5d' },
  '5m':   { interval: '5m',  range: '5d' },
  '15m':  { interval: '15m', range: '5d' },
  '30m':  { interval: '30m', range: '60d' },
  '1h':   { interval: '1h',  range: '60d' },
  '4h':   { interval: '60m', range: '60d' }, // Yahoo doesn't have 4h, use 60m
  '1d':   { interval: '1d',  range: '1y' },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { symbol, days, timeframe = '1h' } = await req.json();

    const tf = TF_MAP[timeframe] || TF_MAP['1h'];
    // Allow days to override range if provided
    const range = days ? `${days}d` : tf.range;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${tf.interval}&range=${range}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    });

    if (!response.ok) {
      return Response.json({ error: `Yahoo Finance error: ${response.status}` }, { status: 400 });
    }

    const json = await response.json();
    const result = json?.chart?.result?.[0];
    if (!result) return Response.json({ error: 'No data returned for this symbol' }, { status: 400 });

    const timestamps = result.timestamp;
    const quote = result.indicators.quote[0];
    const { open, high, low, close, volume } = quote;

    const rows = timestamps.map((ts, i) => {
      const date = new Date(ts * 1000);
      return {
        timestamp: ts,
        date: date.toISOString(),
        hour: date.getUTCHours(),
        dayStart: Math.floor(ts / 86400),
        open: open[i],
        high: high[i],
        low: low[i],
        close: close[i],
        volume: volume[i],
        hl_range: (high[i] != null && low[i] != null) ? high[i] - low[i] : null,
      };
    }).filter(r => r.close != null);

    // Separate current session (last day) from previous
    const uniqueDays = [...new Set(rows.map(r => r.dayStart))];
    const lastDay = Math.max(...uniqueDays);
    const currentRows = rows.filter(r => r.dayStart === lastDay);
    const previousRows = rows.filter(r => r.dayStart < lastDay);

    // Calculate hourly stats for current session
    const hourlyMap = {};
    for (let h = 0; h < 24; h++) hourlyMap[h] = { ranges: [], volumes: [] };

    currentRows.forEach(r => {
      if (r.hl_range != null) hourlyMap[r.hour].ranges.push(r.hl_range);
      if (r.volume != null) hourlyMap[r.hour].volumes.push(r.volume);
    });

    const hourlyVol = Object.entries(hourlyMap).map(([hour, { ranges, volumes }]) => ({
      hour: parseInt(hour),
      avg_range: ranges.length > 0 ? ranges.reduce((a, b) => a + b, 0) / ranges.length : 0,
      avg_volume: volumes.length > 0 ? volumes.reduce((a, b) => a + b, 0) / volumes.length : 0,
      count: ranges.length,
    }));

    // Calculate hourly stats for previous sessions
    const prevHourlyMap = {};
    for (let h = 0; h < 24; h++) prevHourlyMap[h] = { ranges: [], volumes: [] };

    previousRows.forEach(r => {
      if (r.hl_range != null) prevHourlyMap[r.hour].ranges.push(r.hl_range);
      if (r.volume != null) prevHourlyMap[r.hour].volumes.push(r.volume);
    });

    const previousHourlyVol = Object.entries(prevHourlyMap).map(([hour, { ranges, volumes }]) => ({
      hour: parseInt(hour),
      avg_range: ranges.length > 0 ? ranges.reduce((a, b) => a + b, 0) / ranges.length : 0,
      avg_volume: volumes.length > 0 ? volumes.reduce((a, b) => a + b, 0) / volumes.length : 0,
      count: ranges.length,
    }));

    // NY open price (hour 13 UTC = 9am ET)
    const nyRows = rows.filter(r => r.hour === 13);
    const nyOpenPrice = nyRows.length > 0 ? nyRows[nyRows.length - 1].open : null;

    return Response.json({
      rows,
      hourlyVol,
      nyOpenPrice,
      meta: result.meta,
      timeframe,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});