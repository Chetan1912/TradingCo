import { useState, useEffect } from 'react';
import { alertApi } from '../../api/alertApi';
import { formatCurrency } from '../../utils/formatters';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [symbol, setSymbol] = useState('');
  const [alertType, setAlertType] = useState('PRICE_ABOVE');
  const [targetValue, setTargetValue] = useState('');

  const fetchAlerts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await alertApi.getAlerts();
      setAlerts(data);
    } catch {
      setError('Failed to fetch price alerts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!symbol.trim() || !targetValue.trim()) return;

    try {
      await alertApi.createAlert({
        symbol: symbol.trim().toUpperCase(),
        alertType,
        targetValue: parseFloat(targetValue),
      });
      setSymbol('');
      setTargetValue('');
      fetchAlerts();
    } catch {
      alert('Failed to create price alert.');
    }
  };

  const handleToggle = async (id, currentActive) => {
    try {
      await alertApi.toggleAlert(id, !currentActive);
      fetchAlerts();
    } catch {
      alert('Failed to toggle alert.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this price alert?')) return;
    try {
      await alertApi.deleteAlert(id);
      fetchAlerts();
    } catch {
      alert('Failed to delete alert.');
    }
  };

  return (
    <div className="grid-responsive-sidebar" style={{ animation: 'fadeIn 300ms ease-out' }}>
      
      {/* Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>🔔 Price Alerts</h1>

        {error && (
          <div style={{ padding: 'var(--space-md)', background: 'rgba(248, 81, 73, 0.1)', border: '1px solid var(--loss-red)', color: 'var(--loss-red)', borderRadius: 'var(--radius-sm)' }}>
            {error}
          </div>
        )}

        {isLoading && alerts.length === 0 ? (
          <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading alerts...
          </div>
        ) : alerts.length === 0 ? (
          <div className="card" style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No price alerts created yet. Use the panel on the right to set up notifications for your target assets.
          </div>
        ) : (
          <div className="card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Symbol', 'Condition', 'Target Value', 'Status', 'Triggered At', 'Actions'].map(h => (
                    <th key={h} style={{ padding: 'var(--space-sm) var(--space-md)', textAlign: h === 'Symbol' ? 'left' : 'right', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {alerts.map((a) => (
                  <tr key={a.id}>
                    <td style={{ padding: 'var(--space-sm) var(--space-md)', fontWeight: 600 }}>{a.symbol}</td>
                    <td style={{ textAlign: 'right', padding: 'var(--space-sm) var(--space-md)' }}>
                      <span style={{ fontSize: 'var(--text-xs)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                        {a.alertType === 'PRICE_ABOVE' ? 'PRICE ≥' : 'PRICE ≤'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', padding: 'var(--space-sm) var(--space-md)' }}>
                      {formatCurrency(a.targetValue)}
                    </td>
                    <td style={{ textAlign: 'right', padding: 'var(--space-sm) var(--space-md)' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)', fontWeight: 600,
                        background: a.isTriggered ? 'rgba(63, 185, 80, 0.15)' : a.isActive ? 'rgba(88, 166, 255, 0.15)' : 'rgba(255,255,255,0.06)',
                        color: a.isTriggered ? 'var(--profit-green)' : a.isActive ? 'var(--accent-blue)' : 'var(--text-muted)'
                      }}>
                        {a.isTriggered ? 'TRIGGERED' : a.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', padding: 'var(--space-sm) var(--space-md)', fontSize: 'var(--text-xs)' }}>
                      {a.triggeredAt ? new Date(a.triggeredAt).toLocaleString() : '—'}
                    </td>
                    <td style={{ textAlign: 'right', padding: 'var(--space-sm) var(--space-md)' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
                        {!a.isTriggered && (
                          <button 
                            onClick={() => handleToggle(a.id, a.isActive)} 
                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}
                            title={a.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {a.isActive ? '⏸️' : '▶️'}
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(a.id)} 
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Alert Panel */}
      <div className="card" style={{ padding: 'var(--space-lg)', alignSelf: 'start' }}>
        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-lg)', paddingBottom: '4px', borderBottom: '1px solid var(--border)' }}>
          🔔 New Price Alert
        </h3>

        <form onSubmit={handleCreateAlert} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Ticker Symbol</label>
            <input 
              type="text" 
              placeholder="e.g. AAPL" 
              value={symbol} 
              onChange={(e) => setSymbol(e.target.value)}
              style={{ padding: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Alert Condition</label>
            <select 
              value={alertType} 
              onChange={(e) => setAlertType(e.target.value)}
              style={{ padding: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }}
            >
              <option value="PRICE_ABOVE">Price rises above (≥)</option>
              <option value="PRICE_BELOW">Price falls below (≤)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Target Price ($)</label>
            <input 
              type="number" 
              step="0.01"
              placeholder="e.g. 195.50" 
              value={targetValue} 
              onChange={(e) => setTargetValue(e.target.value)}
              style={{ padding: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }}
              required
            />
          </div>

          <button 
            type="submit" 
            style={{ 
              marginTop: 'var(--space-sm)',
              padding: '10px', 
              background: 'var(--accent-blue)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 'var(--radius-sm)', 
              fontWeight: 600, 
              cursor: 'pointer', 
              fontSize: 'var(--text-sm)' 
            }}
          >
            Create Price Alert
          </button>
        </form>
      </div>

    </div>
  );
}
