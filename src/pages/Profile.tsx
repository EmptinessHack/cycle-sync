import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import TopHeader from '../components/TopHeader';
import BottomNav from '../components/BottomNav';
import { clearUserData } from '../utils/storage';
import styles from './Profile.module.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = usePrivy();

  const handleLogout = async () => {
    try {
      // Limpiar datos locales
      clearUserData();
      // Hacer logout de Privy
      await logout();
      // Redirigir al login
      navigate('/');
    } catch (error) {
      console.error('Error al hacer logout:', error);
      // Aún así redirigir al login
      navigate('/');
    }
  };

  return (
    <div className={styles.container}>
      <TopHeader />
      <div className={styles.content}>
        <div className={styles.profileCard}>
          <div className={styles.avatar}>
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h2>{user?.email?.split('@')[0] || 'Usuario'}</h2>
          <p className={styles.email}>{user?.email || 'Demo Mode'}</p>
        </div>

        <div className={styles.section}>
          <h3>Settings</h3>
          <button className={styles.btn} onClick={() => navigate('/setup')}>
            Edit cycle & tasks
          </button>
        </div>

        <div className={styles.section}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Clear data & restart
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;
