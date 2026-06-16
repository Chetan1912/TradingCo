export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePassword(password) {
  const errors = [];
  if (!password || password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Must contain an uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Must contain a lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Must contain a number');
  return { valid: errors.length === 0, errors };
}

export function validateOrderQuantity(qty) {
  if (qty == null || qty === '') return { valid: false, error: 'Quantity is required' };
  const n = Number(qty);
  if (isNaN(n) || !Number.isInteger(n)) return { valid: false, error: 'Must be a whole number' };
  if (n <= 0) return { valid: false, error: 'Must be greater than 0' };
  if (n > 100000) return { valid: false, error: 'Maximum 100,000 shares per order' };
  return { valid: true, error: null };
}

export function validatePrice(price) {
  if (price == null || price === '') return { valid: false, error: 'Price is required' };
  const n = Number(price);
  if (isNaN(n)) return { valid: false, error: 'Must be a valid number' };
  if (n <= 0) return { valid: false, error: 'Must be greater than 0' };
  return { valid: true, error: null };
}

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak', color: 'var(--loss-red)' };
  if (score <= 4) return { score, label: 'Medium', color: 'var(--warning-amber)' };
  return { score, label: 'Strong', color: 'var(--profit-green)' };
}
