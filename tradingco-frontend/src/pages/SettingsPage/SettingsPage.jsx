import { useState, useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';
import useAccountStore from '../../store/useAccountStore';
import { authApi } from '../../api/authApi';
import { formatCurrency } from '../../utils/formatters';
import { BALANCE_OPTIONS, EXPERIENCE_LEVELS } from '../../utils/constants';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const loadUser = useAuthStore((s) => s.loadUser);
  const accounts = useAccountStore((s) => s.accounts);
  const activeAccount = useAccountStore((s) => s.activeAccount);
  const fetchAccounts = useAccountStore((s) => s.fetchAccounts);
  const selectAccount = useAccountStore((s) => s.selectAccount);
  const createAccount = useAccountStore((s) => s.createAccount);
  const resetAccount = useAccountStore((s) => s.resetAccount);

  // Profile Form states
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || 'BEGINNER');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');

  // Account Form states
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState(100000);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  useEffect(() => {
    fetchAccounts();
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setExperienceLevel(user.experienceLevel || 'BEGINNER');
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccess('');
    try {
      await authApi.updateProfile({ displayName, experienceLevel });
      await loadUser();
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch {
      alert('Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCreateAccountSubmit = async (e) => {
    e.preventDefault();
    if (!newAccountName.trim()) return;
    setIsCreatingAccount(true);
    try {
      await createAccount(newAccountName.trim(), parseFloat(newAccountBalance));
      setNewAccountName('');
      setIsCreatingAccount(false);
    } catch {
      alert('Failed to create account.');
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleResetAccount = async (accountId) => {
    if (!window.confirm('Reset this account to its initial starting balance? This will clear cash and portfolio metrics.')) return;
    try {
      await resetAccount(accountId);
      alert('Account reset successfully.');
    } catch {
      alert('Failed to reset account.');
    }
  };

  return (
    <div className="grid-responsive-2col" style={{ animation: 'fadeIn 300ms ease-out' }}>
      
      {/* Profile Settings */}
      <div className="card" style={{ padding: 'var(--space-lg)' }}>
        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-lg)', paddingBottom: '4px', borderBottom: '1px solid var(--border)' }}>
          👤 Profile Settings
        </h3>

        {profileSuccess && (
          <div style={{ marginBottom: 'var(--space-md)', padding: 'var(--space-sm)', background: 'rgba(63, 185, 80, 0.12)', color: 'var(--profit-green)', border: '1px solid var(--profit-green)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)' }}>
            {profileSuccess}
          </div>
        )}

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>Email</label>
            <input 
              type="text" 
              value={user?.email || ''} 
              disabled 
              style={{ padding: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', outline: 'none', cursor: 'not-allowed' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>Display Name</label>
            <input 
              type="text" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)}
              style={{ padding: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>Experience Level</label>
            <select 
              value={experienceLevel} 
              onChange={(e) => setExperienceLevel(e.target.value)}
              style={{ padding: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }}
            >
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={isSavingProfile}
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
            {isSavingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Account Settings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        
        {/* Accounts List */}
        <div className="card" style={{ padding: 'var(--space-lg)' }}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-lg)', paddingBottom: '4px', borderBottom: '1px solid var(--border)' }}>
            💼 Paper Trading Accounts
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {accounts.map((acc) => (
              <div 
                key={acc.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-sm) var(--space-md)',
                  borderRadius: 'var(--radius-sm)',
                  background: activeAccount?.id === acc.id ? 'rgba(88, 166, 255, 0.08)' : 'var(--bg-primary)',
                  border: activeAccount?.id === acc.id ? '1px solid var(--accent-blue)' : '1px solid var(--border)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: activeAccount?.id === acc.id ? 'var(--accent-blue)' : 'var(--text-primary)' }}>
                    {acc.name}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    Cash: {formatCurrency(acc.cashBalance)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  {activeAccount?.id !== acc.id && (
                    <button 
                      onClick={() => selectAccount(acc.id)}
                      style={{ padding: '4px 8px', fontSize: 'var(--text-xs)', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                      Switch
                    </button>
                  )}
                  <button 
                    onClick={() => handleResetAccount(acc.id)}
                    style={{ padding: '4px 8px', fontSize: 'var(--text-xs)', background: 'none', border: '1px solid var(--loss-red)', borderRadius: 'var(--radius-sm)', color: 'var(--loss-red)', cursor: 'pointer' }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Account Form */}
        <div className="card" style={{ padding: 'var(--space-lg)' }}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-lg)', paddingBottom: '4px', borderBottom: '1px solid var(--border)' }}>
            ➕ Create New Trading Account
          </h3>

          <form onSubmit={handleCreateAccountSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>Account Name</label>
              <input 
                type="text" 
                placeholder="e.g. Aggressive Growth, Daytrading" 
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                style={{ padding: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>Starting Cash Balance</label>
              <select 
                value={newAccountBalance} 
                onChange={(e) => setNewAccountBalance(e.target.value)}
                style={{ padding: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }}
              >
                {BALANCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <button 
              type="submit" 
              disabled={isCreatingAccount}
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
              {isCreatingAccount ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
