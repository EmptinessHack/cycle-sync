import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import CycleInput from '../components/CycleInput';
import TaskFormCard from '../components/TaskFormCard';
import { Task } from '../types';
import { organizeTasksByCyclePhase } from '../utils/cycleLogic';
import { saveUserData, loadUserData } from '../utils/storage';
import styles from './Setup.module.css';

const Setup = () => {
  const { authenticated, ready } = usePrivy();
  const navigate = useNavigate();
  const [cycleDay, setCycleDay] = useState(1);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (ready && !authenticated) {
      navigate('/');
    } else {
      const saved = loadUserData();
      if (saved) {
        setCycleDay(saved.cycleDay);
        setTasks(saved.tasks);
      }
    }
  }, [ready, authenticated, navigate]);

  const addTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: '',
      category: 'Entrepreneur',
      isFixed: false,
      duration: '01:00',
      repeatsWeekly: false,
      isProject: false,
    };
    setTasks([...tasks, newTask]);
  };

  const saveTask = (updatedTask: Task) => {
    setTasks(prev =>
      prev.map(t => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleGenerate = () => {
    const schedule = organizeTasksByCyclePhase(cycleDay, tasks);
    saveUserData({ cycleDay, tasks, schedule });
    navigate('/today');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Set up your cycle</h1>
        <p>Tell us about your current cycle and tasks</p>
      </div>

      <div className={styles.content}>
        <CycleInput value={cycleDay} onChange={setCycleDay} />

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Your tasks for this cycle</h2>
            <button onClick={addTask} className={styles.addBtn}>
              + Add Task
            </button>
          </div>

          <div className={styles.taskList}>
            {tasks.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No tasks yet. Click "Add Task" to get started!</p>
              </div>
            ) : (
              tasks.map(task => (
                <TaskFormCard
                  key={task.id}
                  task={task}
                  onSave={saveTask}
                  onDelete={() => deleteTask(task.id)}
                />
              ))
            )}
          </div>
        </div>

        {tasks.length > 0 && (
          <button
            className="btn-primary"
            onClick={handleGenerate}
            style={{ width: '100%', padding: 'var(--spacing-lg)' }}
          >
            Save tasks & generate schedule
          </button>
        )}
      </div>
    </div>
  );
};

export default Setup;
