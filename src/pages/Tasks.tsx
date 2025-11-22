import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import TopHeader from '../components/TopHeader';
import BottomNav from '../components/BottomNav';
import styles from './Tasks.module.css';

const Tasks = () => {
  const { authenticated } = usePrivy();
  const navigate = useNavigate();

  if (!authenticated) {
    navigate('/');
    return null;
  }

  return (
    <div className={styles.container}>
      <TopHeader />
      <div className={styles.content}>
        <h1>All Tasks</h1>
        <p>Coming soon: View and manage all your tasks</p>
      </div>
      <BottomNav />
    </div>
  );
};

export default Tasks;
