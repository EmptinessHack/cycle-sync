import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import TopHeader from '../components/TopHeader';
import BottomNav from '../components/BottomNav';
import { clearUserData } from '../utils/storage';
import styles from './Profile.module.css';

const Profile = () => {
  const { authenticated, user, logout } = usePrivy();
  const navigate = useNavigate();

  if (!authenticated) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    clearUserData();
    logout();
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <TopHeader />
      <div className={styles.content}>
        <div className={styles.profileCard}>
          <div className={styles.avatar}>L</div>
          <h2>Luna</h2>
          <p className={styles.email}>{user?.email?.address || 'No email'}</p>
        </div>

        <div className={styles.section}>
          <h3>Settings</h3>
          <button className={styles.btn} onClick={() => navigate('/setup')}>
            Edit cycle & tasks
          </button>
        </div>

        <div className={styles.section}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;
