import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { createChart, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts';
import { calculateSMA, calculateEMA, calculateRSI, calculateMACD, calculateBollingerBands } from '../../../utils/indicators';
import { formatCurrency, formatPercent, getPnlClass } from '../../../utils/formatters';
import styles from './TradingChart.module.css';

const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1D', '1W'];
const INDICATORS = ['SMA 20', 'EMA 12', 'EMA 26', 'BB', 'VWAP'];

const CHART_COLORS = {
  background: '#0D1117',
  text: '#8B949E',
  grid: '#1C2333',
  crosshair: '#58A6FF',
  upColor: '#3FB950',
  downColor: '#F85149',
  sma: '#FFD700',
  ema12: '#58A6FF',
  ema26: '#F0883E',
  bbUpper: 'rgba(136, 198, 255, 0.4)',
  bbLower: 'rgba(136, 198, 255, 0.4)',
  bbMiddle: 'rgba(136, 198, 255, 0.6)',
};

/**
 * Generate mock candlestick data for demo when no API is available.
 */
function generateMockCandles(symbol, timeframe, count = 200) {
  const data = [];
  const seed = symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  let rng = seed;
  const next = () => { rng = (rng * 16807 + 0) % 2147483647; return rng / 2147483647; };

  let basePrice = 100 + (seed % 400);
  const now = Math.floor(Date.now() / 1000);
  const intervalSec = { '1m': 60, '5m': 300, '15m': 900, '1h': 3600, '4h': 14400, '1D': 86400, '1W': 604800 }[timeframe] || 86400;

  for (let i = count; i > 0; i--) {
    const time = now - i * intervalSec;
    const change = (next() - 0.48) * basePrice * 0.025;
    const open = basePrice;
    const close = basePrice + change;
    const high = Math.max(open, close) * (1 + next() * 0.008);
    const low = Math.min(open, close) * (1 - next() * 0.008);
    const volume = Math.floor(next() * 5000000 + 500000);

    data.push({
      time,
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume,
    });
    basePrice = close;
  }
  return data;
}

export default function TradingChart({ symbol = 'AAPL', onSymbolChange }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef({});
  const [activeTimeframe, setActiveTimeframe] = useState('1D');
  const [activeIndicators, setActiveIndicators] = useState(['SMA 20']);
  const [crosshairData, setCrosshairData] = useState(null);

  // Generate chart data (mock for now, will be replaced with API)
  const chartData = useMemo(() => generateMockCandles(symbol, activeTimeframe), [symbol, activeTimeframe]);

  const lastCandle = chartData[chartData.length - 1];
  const prevCandle = chartData[chartData.length - 2];
  const priceChange = lastCandle && prevCandle ? lastCandle.close - prevCandle.close : 0;
  const priceChangePct = prevCandle ? (priceChange / prevCandle.close) * 100 : 0;

  const toggleIndicator = useCallback((name) => {
    setActiveIndicators((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  }, []);

  // Create and manage chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: { background: { color: CHART_COLORS.background }, textColor: CHART_COLORS.text },
      grid: {
        vertLines: { color: CHART_COLORS.grid },
        horzLines: { color: CHART_COLORS.grid },
      },
      crosshair: { mode: 0, vertLine: { color: CHART_COLORS.crosshair, width: 1, style: 2, labelBackgroundColor: CHART_COLORS.crosshair },
        horzLine: { color: CHART_COLORS.crosshair, width: 1, style: 2, labelBackgroundColor: CHART_COLORS.crosshair } },
      rightPriceScale: { borderColor: CHART_COLORS.grid },
      timeScale: { borderColor: CHART_COLORS.grid, timeVisible: activeTimeframe !== '1D' && activeTimeframe !== '1W' },
    });

    chartRef.current = chart;

    // Candlestick series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: CHART_COLORS.upColor, downColor: CHART_COLORS.downColor,
      borderUpColor: CHART_COLORS.upColor, borderDownColor: CHART_COLORS.downColor,
      wickUpColor: CHART_COLORS.upColor, wickDownColor: CHART_COLORS.downColor,
    });
    candleSeries.setData(chartData);
    seriesRef.current.candles = candleSeries;

    // Volume series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });
    volumeSeries.setData(
      chartData.map((d) => ({
        time: d.time,
        value: d.volume,
        color: d.close >= d.open ? 'rgba(63, 185, 80, 0.25)' : 'rgba(248, 81, 73, 0.25)',
      }))
    );
    seriesRef.current.volume = volumeSeries;

    // Indicators
    const indicatorSeries = [];

    if (activeIndicators.includes('SMA 20')) {
      const smaData = calculateSMA(chartData, 20);
      const s = chart.addSeries(LineSeries, { color: CHART_COLORS.sma, lineWidth: 1, priceLineVisible: false });
      s.setData(smaData);
      indicatorSeries.push(s);
    }

    if (activeIndicators.includes('EMA 12')) {
      const emaData = calculateEMA(chartData, 12);
      const s = chart.addSeries(LineSeries, { color: CHART_COLORS.ema12, lineWidth: 1, priceLineVisible: false });
      s.setData(emaData);
      indicatorSeries.push(s);
    }

    if (activeIndicators.includes('EMA 26')) {
      const emaData = calculateEMA(chartData, 26);
      const s = chart.addSeries(LineSeries, { color: CHART_COLORS.ema26, lineWidth: 1, priceLineVisible: false });
      s.setData(emaData);
      indicatorSeries.push(s);
    }

    if (activeIndicators.includes('BB')) {
      const bb = calculateBollingerBands(chartData, 20, 2);
      const su = chart.addSeries(LineSeries, { color: CHART_COLORS.bbUpper, lineWidth: 1, priceLineVisible: false });
      const sl = chart.addSeries(LineSeries, { color: CHART_COLORS.bbLower, lineWidth: 1, priceLineVisible: false });
      const sm = chart.addSeries(LineSeries, { color: CHART_COLORS.bbMiddle, lineWidth: 1, lineStyle: 2, priceLineVisible: false });
      su.setData(bb.upper);
      sl.setData(bb.lower);
      sm.setData(bb.middle);
      indicatorSeries.push(su, sl, sm);
    }

    seriesRef.current.indicators = indicatorSeries;

    // Crosshair move handler
    chart.subscribeCrosshairMove((param) => {
      if (!param.time) { setCrosshairData(null); return; }
      const candle = param.seriesData?.get(candleSeries);
      if (candle) {
        setCrosshairData({
          open: candle.open, high: candle.high, low: candle.low, close: candle.close,
          time: param.time,
        });
      }
    });

    // Fit content
    chart.timeScale().fitContent();

    // Resize handler
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(chartContainerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      seriesRef.current = {};
    };
  }, [chartData, activeTimeframe, activeIndicators]);

  return (
    <div className={styles.chartContainer}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.symbolInfo}>
          <span className={styles.symbolName}>{symbol}</span>
          {lastCandle && (
            <>
              <span className={styles.symbolPrice}>{formatCurrency(lastCandle.close)}</span>
              <span className={`${styles.symbolChange} ${getPnlClass(priceChange)}`}>
                {priceChange >= 0 ? '▲' : '▼'} {formatCurrency(Math.abs(priceChange))} ({formatPercent(Math.abs(priceChangePct))})
              </span>
            </>
          )}
        </div>
        <div className={styles.controls}>
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              className={`${styles.tfBtn} ${activeTimeframe === tf ? styles.active : ''}`}
              onClick={() => setActiveTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Indicator bar */}
      <div className={styles.indicatorBar}>
        {INDICATORS.map((ind) => (
          <button
            key={ind}
            className={`${styles.indicatorChip} ${activeIndicators.includes(ind) ? styles.active : ''}`}
            onClick={() => toggleIndicator(ind)}
          >
            {ind}
          </button>
        ))}
      </div>

      {/* Crosshair data overlay */}
      {crosshairData && (
        <div className={styles.crosshairData}>
          <span>O: {crosshairData.open?.toFixed(2)}</span>
          <span>H: {crosshairData.high?.toFixed(2)}</span>
          <span>L: {crosshairData.low?.toFixed(2)}</span>
          <span>C: {crosshairData.close?.toFixed(2)}</span>
        </div>
      )}

      {/* Chart canvas */}
      <div ref={chartContainerRef} className={styles.chartWrapper} />
    </div>
  );
}
