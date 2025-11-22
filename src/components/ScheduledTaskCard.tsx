import { ScheduledTask } from '../types';
import styles from './ScheduledTaskCard.module.css';

interface ScheduledTaskCardProps {
  task: ScheduledTask;
}

const ScheduledTaskCard = ({ task }: ScheduledTaskCardProps) => {
  const getEnergyIcon = () => {
    if (task.energyLevel === 'high') return '⚡';
    if (task.energyLevel === 'medium') return '✨';
    return '🌙';
  };

  return (
    <div className={styles.card}>
      <div className={styles.time}>
        {task.startTime} – {task.endTime}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{task.title}</h3>
        <div className={styles.meta}>
          <span className={`pill pill-neutral ${styles.category}`}>
            {task.category}
          </span>
          <div className={styles.icons}>
            <span title={`${task.energyLevel} energy`}>{getEnergyIcon()}</span>
            {task.isProject && <span title="Project">📁</span>}
            {task.repeats && <span title="Repeats">🔄</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduledTaskCard;
