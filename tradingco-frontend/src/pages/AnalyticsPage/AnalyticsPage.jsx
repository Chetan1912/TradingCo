import { useState, useEffect, useRef } from 'react';
import { createChart, AreaSeries } from 'lightweight-charts';
import useAccountStore from '../../store/useAccountStore';
import { analyticsApi } from '../../api/analyticsApi';
import { formatCurrency, formatPercent, getPnlClass } from '../../utils/formatters';

function StatCard({ label, value, color, icon }) {
  return (
    <div className="card" style={{ padding: 'var(--space-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
        <span>{icon}</span>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      </div>
      <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, fontFamily: 'var(--font-mono)', color: color || 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const activeAccount = useAccountStore((s) => s.activeAccount);
  
  const [summary, setSummary] = useState(null);
  const [equityCurve, setEquityCurve] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!activeAccount?.id) return;

    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [sumRes, eqRes] = await Promise.all([
          analyticsApi.getSummary(activeAccount.id),
          analyticsApi.getEquityCurve(activeAccount.id),
        ]);
        setSummary(sumRes.data);
        setEquityCurve(eqRes.data);
      } catch (err) {
        setError('Failed to fetch analytics data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [activeAccount?.id]);

  // Handle Equity Curve Chart rendering
  useEffect(() => {
    if (!chartContainerRef.current || equityCurve.length === 0) return;

    // Format data for lightweight-charts AreaSeries
    // expects { time: 'YYYY-MM-DD' or timestamp, value: number }
    const chartData = equityCurve.map(pt => {
      const date = new Date(pt.time);
      return {
        // time in 'YYYY-MM-DD' format or timestamp
        time: Math.floor(date.getTime() / 1000),
        value: Number(pt.equity),
      };
    });

    // Sort chronologically
    chartData.sort((a, b) => a.time - b.time);

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 250,
      layout: { background: { color: '#0D1117' }, textColor: '#8B949E' },
      grid: {
        vertLines: { color: '#1C2333' },
        horzLines: { color: '#1C2333' },
      },
      rightPriceScale: { borderColor: '#1C2333' },
      timeScale: { borderColor: '#1C2333', timeVisible: true },
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: '#58A6FF',
      topColor: 'rgba(88, 166, 255, 0.4)',
      bottomColor: 'rgba(88, 166, 255, 0.05)',
      lineWidth: 2,
    });

    areaSeries.setData(chartData);
    chart.timeScale().fitContent();

    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [equityCurve]);

  if (!activeAccount) {
    return (
      <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Please login and select an account to view performance analytics.
      </div>
    );
  }

  const m = summary || {
    totalTrades: 0, winRate: 0, profitFactor: 0, sharpeRatio: 0,
    maxDrawdown: 0, totalPnl: 0, bestTrade: 0, worstTrade: 0,
    winners: 0, losers: 0, avgWin: 0, avgLoss: 0, grossProfit: 0, grossLoss: 0
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', animation: 'fadeIn 300ms ease-out' }}>
      <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>📉 Performance Analytics</h1>

      {isLoading && !summary ? (
        <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading performance analytics...
        </div>
      ) : error ? (
        <div style={{ padding: 'var(--space-md)', background: 'rgba(248, 81, 73, 0.1)', border: '1px solid var(--loss-red)', color: 'var(--loss-red)', borderRadius: 'var(--radius-sm)' }}>
          {error}
        </div>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
            <StatCard label="Total P&L" value={`${Number(m.totalPnl) >= 0 ? '+' : ''}${formatCurrency(m.totalPnl)}`} color={Number(m.totalPnl) >= 0 ? 'var(--profit-green)' : 'var(--loss-red)'} icon="💰" />
            <StatCard label="Win Rate" value={`${m.winRate}%`} color={m.winRate >= 50 ? 'var(--profit-green)' : 'var(--loss-red)'} icon="🎯" />
            <StatCard label="Profit Factor" value={Number(m.profitFactor).toFixed(2)} color={Number(m.profitFactor) >= 1 ? 'var(--profit-green)' : 'var(--loss-red)'} icon="⚖️" />
            <StatCard label="Sharpe Ratio" value={Number(m.sharpeRatio).toFixed(2)} color={Number(m.sharpeRatio) >= 1 ? 'var(--profit-green)' : 'var(--warning-amber)'} icon="📊" />
            <StatCard label="Max Drawdown" value={formatCurrency(m.maxDrawdown)} color="var(--loss-red)" icon="📉" />
            <StatCard label="Total Trades" value={m.totalTrades} icon="🔄" />
            <StatCard label="Best Trade" value={`+${formatCurrency(m.bestTrade)}`} color="var(--profit-green)" icon="🏆" />
            <StatCard label="Worst Trade" value={formatCurrency(m.worstTrade)} color="var(--loss-red)" icon="⚠️" />
          </div>

          {/* Breakdown */}
          <div className="grid-responsive-2col">
            <div className="card" style={{ padding: 'var(--space-lg)' }}>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 'var(--space-lg)' }}>Win/Loss Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {[
                  ['Winners', m.winners, 'var(--profit-green)'],
                  ['Losers', m.losers, 'var(--loss-red)'],
                  ['Avg Win', formatCurrency(m.avgWin), 'var(--profit-green)'],
                  ['Avg Loss', formatCurrency(m.avgLoss), 'var(--loss-red)'],
                  ['Gross Profit', formatCurrency(m.grossProfit), 'var(--profit-green)'],
                  ['Gross Loss', formatCurrency(m.grossLoss), 'var(--loss-red)'],
                ].map(([label, val, color]) => (
                  <div key={label} style={{ display: 'flex', justifyContext: 'space-between', padding: 'var(--space-xs) 0', borderBottom: '1px solid rgba(48,54,61,0.3)', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 'var(--space-lg)', alignSelf: 'flex-start' }}>Equity Curve</h3>
              
              {equityCurve.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                  No historical trades to plot equity curve.
                </div>
              ) : (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <div ref={chartContainerRef} style={{ width: '100%', height: 250 }} />
                  
                  {/* Visual win rate bar */}
                  <div style={{ width: '100%', height: 16, borderRadius: 8, overflow: 'hidden', display: 'flex', marginTop: 'var(--space-sm)' }}>
                    <div style={{ width: `${m.winRate}%`, background: 'var(--profit-green)', transition: 'width 1s ease' }} />
                    <div style={{ flex: 1, background: 'var(--loss-red)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    <span>Win: {m.winRate}%</span>
                    <span>Loss: {(100 - m.winRate).toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
