import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { BALANCE_OPTIONS, EXPERIENCE_LEVELS } from '../../utils/constants';
import { getPasswordStrength } from '../../utils/validators';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '', displayName: '',
    experienceLevel: 'BEGINNER', initialBalance: 100000,
  });
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const navigate = useNavigate();
  const strength = getPasswordStrength(form.password);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return;
    try {
      await register(form.email, form.password, form.displayName, form.experienceLevel, Number(form.initialBalance));
      navigate('/dashboard');
    } catch { /* handled by store */ }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>📈</div>
          <div className={styles.logoText}>Trading<span>Co</span></div>
          <div className={styles.subtitle}>Create your trading account</div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Display Name</label>
            <input 
              className={styles.inputField}
              type="text" 
              placeholder="Your name" 
              value={form.displayName} 
              onChange={handleChange('displayName')} 
              required 
            />
          </div>
          
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input 
              className={styles.inputField}
              type="email" 
              placeholder="you@example.com" 
              value={form.email} 
              onChange={handleChange('email')} 
              required 
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input 
                className={styles.inputField}
                type="password" 
                placeholder="Min 8 characters" 
                value={form.password} 
                onChange={handleChange('password')} 
                required 
                minLength={8} 
              />
              {form.password && (
                <div className={styles.strengthIndicator} style={{ color: strength.color }}>
                  Strength: {strength.label}
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Confirm Password</label>
              <input 
                className={styles.inputField}
                type="password" 
                placeholder="Repeat password" 
                value={form.confirmPassword} 
                onChange={handleChange('confirmPassword')} 
                required 
              />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <div className={styles.strengthIndicator} style={{ color: 'var(--loss-red)' }}>
                  Passwords don't match
                </div>
              )}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Experience Level</label>
              <select 
                className={styles.inputField}
                value={form.experienceLevel} 
                onChange={handleChange('experienceLevel')}
              >
                {EXPERIENCE_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Starting Capital</label>
              <select 
                className={styles.inputField}
                value={form.initialBalance} 
                onChange={handleChange('initialBalance')}
              >
                {BALANCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className={styles.submitBtn} 
            disabled={isLoading || form.password !== form.confirmPassword}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
