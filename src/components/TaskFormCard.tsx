import { useState, useEffect } from 'react';
import { Task } from '../types';
import { toast } from '../components/ui/sonner';
import styles from './TaskFormCard.module.css';

interface TaskFormCardProps {
  task?: Task;
  onSave: (task: Task) => void | Promise<void>;
  onDelete?: () => void;
  isUploading?: boolean;
  uploadError?: string;
}

const categories = ['Entrepreneur', 'Home', 'Mother', 'Student', 'Fitness', 'Social', 'Self-care'];

// Helper functions for time calculations
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const formatTime12Hour = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Generate time options for selectors
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      options.push({ value: time, label: formatTime12Hour(time) });
    }
  }
  return options;
};

const timeOptions = generateTimeOptions();

const TaskFormCard = ({ task, onSave, onDelete, isUploading, uploadError }: TaskFormCardProps) => {
  const initialTask = task || {
    id: Date.now().toString(),
    title: '',
    category: 'Entrepreneur',
    isFixed: false,
    duration: '01:00',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    deadline: '',
    repeatFrequency: 'none',
    isProject: false,
  };

  const [formData, setFormData] = useState<Task>(initialTask);
  const [savedData, setSavedData] = useState<Task | null>(task || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Resetear isSaved si hay cambios después de guardar
  useEffect(() => {
    if (isSaved && savedData) {
      const hasChanges = (
        formData.title !== savedData.title ||
        formData.category !== savedData.category ||
        formData.isFixed !== savedData.isFixed ||
        formData.duration !== savedData.duration ||
        formData.date !== savedData.date ||
        formData.startTime !== savedData.startTime ||
        formData.endTime !== savedData.endTime ||
        formData.deadline !== savedData.deadline ||
        formData.repeatFrequency !== savedData.repeatFrequency ||
        formData.isProject !== savedData.isProject
      );
      
      if (hasChanges) {
        setIsSaved(false);
      }
    }
  }, [formData, isSaved, savedData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      setIsSaving(true);
      
      // Simular un pequeño delay para mejor UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      onSave(formData);
      
      setIsSaving(false);
      setIsSaved(true);
      setSavedData({ ...formData }); // Guardar el estado actual como referencia
      
      // Mostrar notificación de éxito
      toast.success(task ? 'Task updated successfully!' : 'Task added successfully!', {
        description: `"${formData.title}" has been ${task ? 'updated' : 'added'}.`,
        duration: 3000,
      });
    } else {
      toast.error('Please enter a task title', {
        duration: 2000,
      });
    }
  };

  const updateField = (field: keyof Task, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate relationships for fixed tasks
      if (prev.isFixed) {
        // If duration is manually changed and we have startTime, recalculate endTime
        if (field === 'duration' && prev.startTime && value) {
          const startMinutes = timeToMinutes(prev.startTime);
          const durationMinutes = timeToMinutes(value);
          if (durationMinutes > 0) {
            updated.endTime = minutesToTime(startMinutes + durationMinutes);
          }
        }
        // If startTime is manually changed and we have duration, recalculate endTime
        else if (field === 'startTime' && prev.duration && value) {
          const startMinutes = timeToMinutes(value);
          const durationMinutes = timeToMinutes(prev.duration);
          if (durationMinutes > 0) {
            updated.endTime = minutesToTime(startMinutes + durationMinutes);
          }
        }
        // If endTime is manually changed, recalculate duration based on startTime
        else if (field === 'endTime' && prev.startTime && value) {
          const startMinutes = timeToMinutes(prev.startTime);
          const endMinutes = timeToMinutes(value);
          const durationMinutes = endMinutes - startMinutes;
          if (durationMinutes > 0) {
            updated.duration = minutesToTime(durationMinutes);
          }
        }
      }
      
      return updated;
    });
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

      {formData.isFixed ? (
        <>
          <div className={styles.row}>
            <div className={`${styles.field} ${styles.durationField}`}>
              <label>Duration</label>
              <input
                type="text"
                placeholder="HH:MM"
                value={formData.duration || '01:00'}
                onChange={(e) => {
                  const value = e.target.value;
                  // Permitir solo números y dos puntos
                  const cleaned = value.replace(/[^\d:]/g, '');
                  // Limitar a formato HH:MM
                  if (cleaned.length <= 5) {
                    // Si el usuario está escribiendo, formatear automáticamente
                    if (cleaned.length === 2 && !cleaned.includes(':')) {
                      updateField('duration', cleaned + ':');
                    } else if (cleaned.length <= 5) {
                      updateField('duration', cleaned);
                    }
                  }
                }}
                onBlur={(e) => {
                  // Validar y formatear al perder el foco
                  const value = e.target.value;
                  const parts = value.split(':');
                  if (parts.length === 2) {
                    let hours = parseInt(parts[0]) || 0;
                    let minutes = parseInt(parts[1]) || 0;
                    hours = Math.max(0, Math.min(23, hours));
                    minutes = Math.max(0, Math.min(59, minutes));
                    updateField('duration', `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
                  } else if (value && !value.includes(':')) {
                    // Si solo hay números, intentar formatear
                    const num = parseInt(value) || 0;
                    if (num < 24) {
                      updateField('duration', `${num.toString().padStart(2, '0')}:00`);
                    }
                  }
                }}
                className={styles.durationInputSingle}
              />
            </div>
            <div className={`${styles.field} ${styles.dateField}`}>
              <label>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => updateField('date', e.target.value)}
                className={styles.input}
              />
            </div>
          </div>
          <div className={styles.row}>
            <div className={`${styles.field} ${styles.timeField}`}>
              <label>Start</label>
              <select
                value={formData.startTime || '09:00'}
                onChange={(e) => updateField('startTime', e.target.value)}
                className={styles.timeSelect}
              >
                {timeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={`${styles.field} ${styles.timeField}`}>
              <label>End</label>
              <select
                value={formData.endTime || '10:00'}
                onChange={(e) => updateField('endTime', e.target.value)}
                className={styles.timeSelect}
              >
                {timeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.row}>
          <div className={`${styles.field} ${styles.durationField}`}>
            <label>Duration</label>
            <input
              type="text"
              placeholder="HH:MM"
              value={formData.duration || '01:00'}
              onChange={(e) => {
                const value = e.target.value;
                const cleaned = value.replace(/[^\d:]/g, '');
                if (cleaned.length <= 5) {
                  if (cleaned.length === 2 && !cleaned.includes(':')) {
                    updateField('duration', cleaned + ':');
                  } else if (cleaned.length <= 5) {
                    updateField('duration', cleaned);
                  }
                }
              }}
              onBlur={(e) => {
                const value = e.target.value;
                const parts = value.split(':');
                if (parts.length === 2) {
                  let hours = parseInt(parts[0]) || 0;
                  let minutes = parseInt(parts[1]) || 0;
                  hours = Math.max(0, Math.min(23, hours));
                  minutes = Math.max(0, Math.min(59, minutes));
                  updateField('duration', `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
                } else if (value && !value.includes(':')) {
                  const num = parseInt(value) || 0;
                  if (num < 24) {
                    updateField('duration', `${num.toString().padStart(2, '0')}:00`);
                  }
                }
              }}
              className={styles.durationInputSingle}
            />
          </div>
          <div className={`${styles.field} ${styles.dateField}`}>
            <label>Deadline (optional)</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => updateField('deadline', e.target.value)}
              className={styles.input}
            />
          </div>
        </div>
      )}

      <div className={styles.row}>
        <div className={styles.field}>
          <label>Repeat (optional)</label>
          <select
            value={formData.repeatFrequency || 'none'}
            onChange={(e) => updateField('repeatFrequency', e.target.value)}
            className={styles.select}
          >
            <option value="none">Does not repeat</option>
            <option value="daily">Daily</option>
            <option value="weekdays">Weekdays (Mon-Fri)</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={formData.isProject}
              onChange={(e) => updateField('isProject', e.target.checked)}
            />
            <span>This is a project</span>
          </label>
        </div>
      </div>

      <button 
        type="submit" 
        className={`btn-primary ${styles.submitBtn} ${isSaving || isUploading ? styles.saving : ''} ${isSaved ? styles.saved : ''}`}
        disabled={isSaving || isUploading}
        style={{ width: '100%', marginTop: 'var(--spacing-sm)' }}
      >
        {isUploading ? (
          <>⏳ Guardando en IPFS...</>
        ) : isSaving ? (
          <>
            <span className={styles.spinner}></span>
            {task ? 'Updating...' : 'Adding...'}
          </>
        ) : isSaved ? (
          <>
            <span className={styles.checkmark}>✓</span>
            {task ? 'Updated!' : 'Added!'}
          </>
        ) : (
          task ? 'Update Task' : 'Add Task'
        )}
      </button>
      
      {uploadError && (
        <div style={{ 
          marginTop: 'var(--spacing-sm)', 
          padding: 'var(--spacing-sm)', 
          background: '#fee', 
          color: '#c33',
          borderRadius: '4px',
          fontSize: '0.9rem'
        }}>
          ⚠️ Error al guardar en IPFS: {uploadError}
        </div>
      )}
      
    </form>
  );
};

export default TaskFormCard;
