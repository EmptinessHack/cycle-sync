import { useState } from 'react';
import { Task } from '../types';
import styles from './TaskFormCard.module.css';

interface TaskFormCardProps {
  task?: Task;
  onSave: (task: Task) => void;
  onDelete?: () => void;
}

const categories = ['Entrepreneur', 'Home', 'Mother', 'Student', 'Fitness', 'Social', 'Self-care'];

const TaskFormCard = ({ task, onSave, onDelete }: TaskFormCardProps) => {
  const [formData, setFormData] = useState<Task>(
    task || {
      id: Date.now().toString(),
      title: '',
      category: 'Entrepreneur',
      isFixed: false,
      duration: '01:00',
      date: '',
      startTime: '09:00',
      endTime: '10:00',
      deadline: '',
      repeatsWeekly: false,
      isProject: false,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSave(formData);
    }
  };

  const updateField = (field: keyof Task, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <input
          type="text"
          placeholder="Task title"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          className={styles.titleInput}
          required
        />
        {onDelete && (
          <button type="button" onClick={onDelete} className={styles.deleteBtn}>
            ✕
          </button>
        )}
      </div>

      <div className={styles.row}>
        <select
          value={formData.category}
          onChange={(e) => updateField('category', e.target.value)}
          className={styles.select}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <div className={styles.toggleGroup}>
          <button
            type="button"
            className={`${styles.toggleBtn} ${!formData.isFixed ? styles.active : ''}`}
            onClick={() => updateField('isFixed', false)}
          >
            Flexible
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${formData.isFixed ? styles.active : ''}`}
            onClick={() => updateField('isFixed', true)}
          >
            Fixed
          </button>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label>Duration</label>
          <input
            type="time"
            value={formData.duration}
            onChange={(e) => updateField('duration', e.target.value)}
            className={styles.input}
          />
        </div>
        
        {formData.isFixed ? (
          <>
            <div className={styles.field}>
              <label>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => updateField('date', e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label>Start</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => updateField('startTime', e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label>End</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => updateField('endTime', e.target.value)}
                className={styles.input}
              />
            </div>
          </>
        ) : (
          <div className={styles.field}>
            <label>Deadline (optional)</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => updateField('deadline', e.target.value)}
              className={styles.input}
            />
          </div>
        )}
      </div>

      <div className={styles.switches}>
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={formData.repeatsWeekly}
            onChange={(e) => updateField('repeatsWeekly', e.target.checked)}
          />
          <span>Repeats weekly</span>
        </label>
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={formData.isProject}
            onChange={(e) => updateField('isProject', e.target.checked)}
          />
          <span>This is a project</span>
        </label>
      </div>

      <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 'var(--spacing-sm)' }}>
        {task ? 'Update Task' : 'Add Task'}
      </button>
    </form>
  );
};

export default TaskFormCard;
