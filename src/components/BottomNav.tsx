import { useNavigate, useLocation } from 'react-router-dom';
import styles from './BottomNav.module.css';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/today', icon: '🏠', label: 'Today' },
    { path: '/calendar', icon: '📅', label: 'Calendar' },
    { path: '/tasks', icon: '✓', label: 'Tasks' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <nav className={styles.nav}>
      {navItems.map(item => (
        <button
          key={item.path}
          className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
          onClick={() => navigate(item.path)}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
