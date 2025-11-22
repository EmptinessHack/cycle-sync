import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import TopHeader from '../components/TopHeader';
import BottomNav from '../components/BottomNav';
import ScheduledTaskCard from '../components/ScheduledTaskCard';
import { loadUserData } from '../utils/storage';
import { getCyclePhase, getPhaseDescription, getPhaseColor } from '../utils/cycleLogic';
import { ScheduledTask } from '../types';
import styles from './Today.module.css';

const Today = () => {
  const { authenticated, ready } = usePrivy();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (ready && !authenticated) {
      navigate('/');
    } else {
      const data = loadUserData();
      if (!data || data.schedule.length === 0) {
        navigate('/setup');
      } else {
        setUserData(data);
      }
    }
  }, [ready, authenticated, navigate]);

  if (!userData) return null;

  const phase = getCyclePhase(userData.cycleDay);
  const phaseDesc = getPhaseDescription(phase);
  const phaseColor = getPhaseColor(phase);

  const tasksForDate = userData.schedule.filter(
    (task: ScheduledTask) => task.date === selectedDate
  );

  const totalMinutes = tasksForDate.reduce((sum: number, task: ScheduledTask) => {
    const [startH, startM] = task.startTime.split(':').map(Number);
    const [endH, endM] = task.endTime.split(':').map(Number);
    return sum + (endH * 60 + endM - startH * 60 - startM);
  }, 0);

  const loadPercentage = Math.min(Math.round((totalMinutes / (8 * 60)) * 100), 100);

  // Generate date selector (7 days)
  const dates = [];
  const today = new Date();
  for (let i = -1; i <= 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }

  return (
    <div className={styles.container}>
      <TopHeader userName="Luna" />

      <div className={styles.content}>
        <div className={styles.dateSelector}>
          {dates.map(date => {
            const dateStr = date.toISOString().split('T')[0];
            const isSelected = dateStr === selectedDate;
            const dayNum = date.getDate();
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

            return (
              <button
                key={dateStr}
                className={`${styles.dateBtn} ${isSelected ? styles.active : ''}`}
                onClick={() => setSelectedDate(dateStr)}
              >
                <div className={styles.dayNum}>{dayNum}</div>
                <div className={styles.dayName}>{dayName}</div>
              </button>
            );
          })}
        </div>

        <div
          className={styles.phaseBanner}
          style={{ background: phaseColor }}
        >
          <div className={styles.phaseContent}>
            <span className={styles.dayLabel}>Day {userData.cycleDay}</span>
            <h2 className={styles.phaseName}>{phase.toUpperCase()}</h2>
            <p className={styles.phaseDesc}>{phaseDesc}</p>
          </div>
        </div>

        <div className={styles.loadSection}>
          <div className={styles.loadHeader}>
            <h3>For today</h3>
            <span className={styles.loadPercent}>{loadPercentage}% load</span>
          </div>
          <div className={styles.loadBar}>
            <div
              className={styles.loadFill}
              style={{ width: `${loadPercentage}%` }}
            />
          </div>
        </div>

        <div className={styles.taskSection}>
          <div className={styles.taskHeader}>
            <h3>Schedule</h3>
            <button className={styles.addQuickTask}>+ Quick task</button>
          </div>

          <div className={styles.taskList}>
            {tasksForDate.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No tasks scheduled for this day</p>
              </div>
            ) : (
              tasksForDate.map((task: ScheduledTask) => (
                <ScheduledTaskCard key={task.id} task={task} />
              ))
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Today;
