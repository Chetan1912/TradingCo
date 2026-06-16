/**
 * Format a number as currency: $1,234.56
 */
export function formatCurrency(value, decimals = 2) {
  if (value == null || isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a number with commas: 1,234.56
 */
export function formatNumber(value, decimals = 2) {
  if (value == null || isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format as percentage with sign: +1.23% or -1.23%
 */
export function formatPercent(value, decimals = 2) {
  if (value == null || isNaN(value)) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers: 1.2B, 340M, 52K
 */
export function formatLargeNumber(value) {
  if (value == null || isNaN(value)) return '—';
  const abs = Math.abs(value);
  if (abs >= 1e12) return (value / 1e12).toFixed(1) + 'T';
  if (abs >= 1e9) return (value / 1e9).toFixed(1) + 'B';
  if (abs >= 1e6) return (value / 1e6).toFixed(1) + 'M';
  if (abs >= 1e3) return (value / 1e3).toFixed(1) + 'K';
  return value.toString();
}

/**
 * Format volume: 52.3M
 */
export function formatVolume(value) {
  return formatLargeNumber(value);
}

/**
 * Format date: Mar 15, 2024
 */
export function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

/**
 * Format time: 2:30 PM
 */
export function formatTime(date) {
  if (!date) return '—';
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

/**
 * Format date and time: Mar 15, 2024 2:30 PM
 */
export function formatDateTime(date) {
  if (!date) return '—';
  return `${formatDate(date)} ${formatTime(date)}`;
}

/**
 * Format relative time: 2 hours ago, just now
 */
export function formatRelativeTime(date) {
  if (!date) return '—';
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

/**
 * Get CSS color variable for P&L value
 */
export function getPnlColor(value) {
  if (value > 0) return 'var(--profit-green)';
  if (value < 0) return 'var(--loss-red)';
  return 'var(--text-secondary)';
}

/**
 * Get CSS class for P&L value
 */
export function getPnlClass(value) {
  if (value > 0) return 'text-green';
  if (value < 0) return 'text-red';
  return 'text-secondary';
}

/**
 * Format P&L with sign and currency: +$1,234.56
 */
export function formatPnl(value, decimals = 2) {
  if (value == null || isNaN(value)) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${formatCurrency(value, decimals)}`;
}
