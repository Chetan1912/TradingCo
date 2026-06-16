import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './components/layout/AppLayout/AppLayout';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import MarketsPage from './pages/MarketsPage/MarketsPage';
import PortfolioPage from './pages/PortfolioPage/PortfolioPage';
import AnalyticsPage from './pages/AnalyticsPage/AnalyticsPage';
import ScreenerPage from './pages/ScreenerPage/ScreenerPage';
import NewsPage from './pages/NewsPage/NewsPage';
import JournalPage from './pages/JournalPage/JournalPage';
import AlertsPage from './pages/AlertsPage/AlertsPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';

// Placeholder for pages still in development
function PlaceholderPage({ title, icon }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '60vh', gap: '16px', animation: 'fadeIn 300ms ease-out'
    }}>
      <span style={{ fontSize: '3rem' }}>{icon}</span>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{title}</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Coming soon</p>
    </div>
  );
}

export default function App() {
  const loadUser = useAuthStore((s) => s.loadUser);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/markets" element={<MarketsPage />} />
        <Route path="/asset/:symbol" element={<MarketsPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/orders" element={<PortfolioPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/watchlists" element={<DashboardPage />} />
        <Route path="/screener" element={<ScreenerPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/calendar" element={<PlaceholderPage title="Economic Calendar" icon="📅" />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
    </Routes>
  );
}
