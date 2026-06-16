import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';
import useSettingsStore from '../../../store/useSettingsStore';
import styles from './Header.module.css';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const toggleSidebar = useSettingsStore((s) => s.toggleSidebar);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/asset/${searchQuery.trim().toUpperCase()}`);
      setSearchQuery('');
    }
  };

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <header className={styles.header}>
      <button className={styles.menuBtn} onClick={toggleSidebar} aria-label="Toggle Sidebar">
        ☰
      </button>
      <div className={styles.logo}>
        📈 Trading<span>Co</span>
      </div>

      <form className={styles.searchWrapper} onSubmit={handleSearch}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search symbol... (e.g. AAPL)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      <div className={styles.actions}>
        <div className={styles.marketStatus}>
          <span className={`${styles.statusDot}`} />
          <span>CLOSED</span>
        </div>

        <button className={styles.iconBtn} title="Notifications">🔔</button>

        <div className={styles.avatar} onClick={logout} title="Logout">
          {initials}
        </div>
      </div>
    </header>
  );
}
