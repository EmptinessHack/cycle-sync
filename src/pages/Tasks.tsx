import TopHeader from '../components/TopHeader';
import BottomNav from '../components/BottomNav';
import styles from './Tasks.module.css';

const Tasks = () => {
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
