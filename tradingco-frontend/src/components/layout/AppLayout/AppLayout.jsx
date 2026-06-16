import { Outlet } from 'react-router-dom';
import Header from '../../common/Header/Header';
import Sidebar from '../../common/Sidebar/Sidebar';
import useSettingsStore from '../../../store/useSettingsStore';
import styles from './AppLayout.module.css';

export default function AppLayout() {
  const sidebarExpanded = useSettingsStore((s) => s.sidebarExpanded);
  const toggleSidebar = useSettingsStore((s) => s.toggleSidebar);

  return (
    <div className={styles.layout}>
      <Sidebar />
      {sidebarExpanded && (
        <div className={styles.backdrop} onClick={toggleSidebar} />
      )}
      <div className={`${styles.main} ${sidebarExpanded ? styles.expanded : ''}`}>
        <Header />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
