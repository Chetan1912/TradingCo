export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
export const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

export const TIMEFRAMES = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '30m', value: '30m' },
  { label: '1H', value: '1h' },
  { label: '4H', value: '4h' },
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
];

export const ORDER_TYPES = {
  MARKET: 'MARKET',
  LIMIT: 'LIMIT',
  STOP: 'STOP',
  STOP_LIMIT: 'STOP_LIMIT',
  BRACKET: 'BRACKET',
};

export const ORDER_SIDES = { BUY: 'BUY', SELL: 'SELL' };

export const ORDER_STATUSES = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  PARTIALLY_FILLED: 'PARTIALLY_FILLED',
  FILLED: 'FILLED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
};

export const MARKET_SESSIONS = {
  PRE_MARKET: 'PRE_MARKET',
  REGULAR: 'REGULAR',
  AFTER_HOURS: 'AFTER_HOURS',
  CLOSED: 'CLOSED',
};

export const DEFAULT_STARTING_BALANCE = 100000;

export const BALANCE_OPTIONS = [
  { label: '$10,000', value: 10000 },
  { label: '$50,000', value: 50000 },
  { label: '$100,000', value: 100000 },
  { label: '$1,000,000', value: 1000000 },
];

export const EXPERIENCE_LEVELS = [
  { value: 'BEGINNER', label: 'Beginner', description: 'New to trading, learning the basics' },
  { value: 'INTERMEDIATE', label: 'Intermediate', description: 'Familiar with markets and order types' },
  { value: 'PRO', label: 'Professional', description: 'Experienced trader, advanced strategies' },
];
