import TopHeader from '../components/TopHeader';
import BottomNav from '../components/BottomNav';
import styles from './Calendar.module.css';

const Calendar = () => {
  return (
    <div className={styles.container}>
      <TopHeader />
      <div className={styles.content}>
        <h1>Calendar View</h1>
        <p>Coming soon: Monthly calendar view with all your scheduled tasks</p>
      </div>
      <BottomNav />
    </div>
  );
};

export default Calendar;
