/**
 * Technical indicator calculations for chart overlays.
 */

/**
 * Simple Moving Average
 */
export function calculateSMA(data, period) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push({ time: data[i].time, value: undefined });
      continue;
    }
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j].close || data[j].value || 0;
    }
    result.push({ time: data[i].time, value: sum / period });
  }
  return result.filter((d) => d.value !== undefined);
}

/**
 * Exponential Moving Average
 */
export function calculateEMA(data, period) {
  const result = [];
  const k = 2 / (period + 1);
  let ema = null;

  for (let i = 0; i < data.length; i++) {
    const val = data[i].close || data[i].value || 0;
    if (ema === null) {
      if (i >= period - 1) {
        let sum = 0;
        for (let j = i - period + 1; j <= i; j++) sum += data[j].close || data[j].value || 0;
        ema = sum / period;
        result.push({ time: data[i].time, value: ema });
      }
    } else {
      ema = val * k + ema * (1 - k);
      result.push({ time: data[i].time, value: ema });
    }
  }
  return result;
}

/**
 * Relative Strength Index
 */
export function calculateRSI(data, period = 14) {
  const result = [];
  if (data.length < period + 1) return result;

  let gainSum = 0, lossSum = 0;
  for (let i = 1; i <= period; i++) {
    const change = (data[i].close || 0) - (data[i - 1].close || 0);
    if (change > 0) gainSum += change;
    else lossSum += Math.abs(change);
  }

  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result.push({ time: data[period].time, value: 100 - 100 / (1 + rs) });

  for (let i = period + 1; i < data.length; i++) {
    const change = (data[i].close || 0) - (data[i - 1].close || 0);
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push({ time: data[i].time, value: 100 - 100 / (1 + rs) });
  }
  return result;
}

/**
 * MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(data, fast = 12, slow = 26, signal = 9) {
  const emaFast = calculateEMA(data, fast);
  const emaSlow = calculateEMA(data, slow);

  // Align by time
  const macdLine = [];
  const slowMap = new Map(emaSlow.map((d) => [d.time, d.value]));
  for (const d of emaFast) {
    const slowVal = slowMap.get(d.time);
    if (slowVal !== undefined) {
      macdLine.push({ time: d.time, value: d.value - slowVal, close: d.value - slowVal });
    }
  }

  const signalLine = calculateEMA(macdLine, signal);
  const signalMap = new Map(signalLine.map((d) => [d.time, d.value]));

  const histogram = [];
  for (const d of macdLine) {
    const sig = signalMap.get(d.time);
    if (sig !== undefined) {
      histogram.push({
        time: d.time,
        value: d.value - sig,
        color: d.value - sig >= 0 ? 'rgba(63, 185, 80, 0.6)' : 'rgba(248, 81, 73, 0.6)',
      });
    }
  }

  return { macdLine, signalLine, histogram };
}

/**
 * Bollinger Bands
 */
export function calculateBollingerBands(data, period = 20, multiplier = 2) {
  const sma = calculateSMA(data, period);
  const upper = [];
  const lower = [];

  for (let i = 0; i < sma.length; i++) {
    const smaIdx = data.findIndex((d) => d.time === sma[i].time);
    if (smaIdx < period - 1) continue;

    let sumSq = 0;
    for (let j = smaIdx - period + 1; j <= smaIdx; j++) {
      const diff = (data[j].close || 0) - sma[i].value;
      sumSq += diff * diff;
    }
    const stdDev = Math.sqrt(sumSq / period);

    upper.push({ time: sma[i].time, value: sma[i].value + multiplier * stdDev });
    lower.push({ time: sma[i].time, value: sma[i].value - multiplier * stdDev });
  }

  return { middle: sma, upper, lower };
}

/**
 * Volume Weighted Average Price
 */
export function calculateVWAP(data) {
  const result = [];
  let cumVolPrice = 0, cumVol = 0;
  for (const bar of data) {
    const typical = ((bar.high || 0) + (bar.low || 0) + (bar.close || 0)) / 3;
    const vol = bar.volume || 1;
    cumVolPrice += typical * vol;
    cumVol += vol;
    result.push({ time: bar.time, value: cumVolPrice / cumVol });
  }
  return result;
}
