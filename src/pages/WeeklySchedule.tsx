import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TopHeader from '../components/TopHeader';
import BottomNav from '../components/BottomNav';
import { getMockSchedule, ScheduledTask } from '../lib/mockSchedule';
import { getCyclePhase } from '../utils/cycleLogic';
import { loadUserData } from '../utils/storage';
import styles from './WeeklySchedule.module.css';

const WeeklySchedule = () => {
  const navigate = useNavigate();
  const userData = loadUserData();
  const currentCycleDay = userData?.cycleDay || 6;
  
  // Get current week dates (7 days starting from today)
  const weekDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, []);
  
  // Get mock schedule data
  const allTasks = useMemo(() => getMockSchedule(currentCycleDay), [currentCycleDay]);
  
  // Get current phase info
  const currentPhase = getCyclePhase(currentCycleDay);
  const phaseInfo = getPhaseInfo(currentPhase);
  
  // Calculate weekly summary
  const weeklySummary = useMemo(() => {
    const deepWorkCount = allTasks.filter(t => t.energyType === 'deep-work').length;
    const flexibleTasks = Math.floor(allTasks.length * 0.3);
    
    return {
      deepWorkBlocks: deepWorkCount,
      flexibleTasks,
      totalTasks: allTasks.length,
    };
  }, [allTasks]);
  
  // Get tasks for each day
  const tasksByDate = useMemo(() => {
    const map: Record<string, ScheduledTask[]> = {};
    weekDates.forEach(date => {
      const dateStr = date.toISOString().split('T')[0];
      map[dateStr] = allTasks.filter(task => task.date === dateStr);
    });
    return map;
  }, [weekDates, allTasks]);
  
  // Time slots (6 AM to 10 PM)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push(hour);
    }
    return slots;
  }, []);
  
  // Helper to convert time to minutes from start of day
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  // Helper to calculate position and height for a task block
  const getTaskPosition = (task: ScheduledTask) => {
    const startMinutes = timeToMinutes(task.startTime);
    const endMinutes = timeToMinutes(task.endTime);
    const duration = endMinutes - startMinutes;
    
    // Each hour slot is 60px tall, starting from 6 AM (360 minutes)
    const top = ((startMinutes - 360) / 60) * 60; // 60px per hour
    const height = (duration / 60) * 60;
    
    return { top, height };
  };
  
  return (
    <div className={styles.container}>
      <TopHeader userName="Luna" />
      
      <div className={styles.content}>
        {/* Cycle Phase Banner */}
        <div className={styles.phaseBanner}>
          <div className={styles.phaseContent}>
            <div className={styles.phaseDayLabel}>Day {currentCycleDay}</div>
            <h2 className={styles.phaseName}>{currentPhase}</h2>
            <p className={styles.phaseSubtitle}>{phaseInfo.subtitle}</p>
          </div>
          <div className={styles.phaseIllustration}>🌙</div>
        </div>
        
        {/* Weekly Summary Card */}
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>📊</div>
          <div className={styles.summaryContent}>
            <h3 className={styles.summaryTitle}>This week at a glance</h3>
            <ul className={styles.summaryList}>
              <li>{weeklySummary.deepWorkBlocks} deep work blocks scheduled</li>
              <li>{weeklySummary.flexibleTasks} flexible tasks moved to low-energy days</li>
              <li>All deadlines covered before PMS</li>
            </ul>
          </div>
        </div>
        
        {/* Week Calendar View */}
        <div className={styles.calendarWrapper}>
          {/* Time column header */}
          <div className={styles.timeColumn}>
            <div className={styles.timeHeader}></div>
            {timeSlots.map(hour => (
              <div key={hour} className={styles.timeSlot}>
                {hour === 6 ? '6 AM' : hour === 12 ? '12 PM' : hour === 18 ? '6 PM' : hour % 12 === 0 ? '12' : hour % 12}
              </div>
            ))}
          </div>
          
          {/* Days columns */}
          <div className={styles.daysContainer}>
            {/* Day headers */}
            <div className={styles.dayHeaders}>
              {weekDates.map(date => {
                const dateStr = date.toISOString().split('T')[0];
                const dayNum = date.getDate();
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                const dayTasks = tasksByDate[dateStr] || [];
                
                return (
                  <div key={dateStr} className={`${styles.dayHeader} ${isToday ? styles.dayHeaderToday : ''}`}>
                    <div className={styles.dayName}>{dayName}</div>
                    <div className={styles.dayNumber}>{dayNum}</div>
                    {dayTasks.length > 0 && (
                      <div className={styles.dayTaskCount}>{dayTasks.length}</div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Calendar grid */}
            <div className={styles.calendarGrid}>
              {weekDates.map(date => {
                const dateStr = date.toISOString().split('T')[0];
                const dayTasks = tasksByDate[dateStr] || [];
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                
                return (
                  <div key={dateStr} className={`${styles.dayColumn} ${isToday ? styles.dayColumnToday : ''}`}>
                    {/* Time slots background */}
                    {timeSlots.map(hour => (
                      <div key={hour} className={styles.hourSlot}></div>
                    ))}
                    
                    {/* Task blocks */}
                    {dayTasks.map(task => {
                      const { top, height } = getTaskPosition(task);
                      return (
                        <TaskBlock
                          key={task.id}
                          task={task}
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                          }}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
};

// Task Block Component
const TaskBlock = ({ 
  task, 
  style 
}: { 
  task: ScheduledTask; 
  style: React.CSSProperties;
}) => {
  const energyIcon = getEnergyIcon(task.energyType);
  const bgColor = getEnergyBackgroundColor(task.energyType);
  const borderColor = getEnergyColor(task.energyType);
  const categoryColor = getCategoryColor(task.category);
  
  return (
    <div 
      className={styles.taskBlock}
      style={{
        ...style,
        backgroundColor: bgColor,
        borderLeft: `3px solid ${borderColor}`,
      }}
    >
      <div className={styles.taskTime}>
        {task.startTime}–{task.endTime}
      </div>
      <div className={styles.taskTitle}>{task.title}</div>
      <div className={styles.taskFooter}>
        <div 
          className={styles.categoryChip}
          style={{ backgroundColor: categoryColor }}
        >
          {task.category}
        </div>
        <div className={styles.taskIcon}>{energyIcon}</div>
      </div>
    </div>
  );
};

// Helper functions
function getPhaseInfo(phase: string) {
  const info: Record<string, { subtitle: string }> = {
    Menstrual: { subtitle: 'Rest & reflect — Time for gentle self-care' },
    Follicular: { subtitle: 'Energy rising — Best for deep work' },
    Ovulatory: { subtitle: 'Peak energy — Perfect for important meetings' },
    Luteal: { subtitle: 'Protect your focus — Soft tasks and admin' },
  };
  return info[phase] || info.Follicular;
}

function getEnergyColor(energyType: ScheduledTask['energyType']): string {
  const colors: Record<string, string> = {
    'deep-work': '#16697A',
    'admin': '#82C0CC',
    'social': '#FFA62B',
    'rest': '#EDE7E3',
  };
  return colors[energyType] || '#EDE7E3';
}

function getEnergyBackgroundColor(energyType: ScheduledTask['energyType']): string {
  const colors: Record<string, string> = {
    'deep-work': 'rgba(22, 105, 122, 0.12)',
    'admin': 'rgba(130, 192, 204, 0.15)',
    'social': 'rgba(255, 166, 43, 0.15)',
    'rest': 'rgba(237, 231, 227, 0.6)',
  };
  return colors[energyType] || '#EDE7E3';
}

function getEnergyIcon(energyType: ScheduledTask['energyType']): string {
  const icons: Record<string, string> = {
    'deep-work': '💡',
    'admin': '🗂',
    'social': '🤝',
    'rest': '🌙',
  };
  return icons[energyType] || '📋';
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Entrepreneur': '#16697A',
    'Home': '#82C0CC',
    'Mother': '#489FB5',
  };
  return colors[category] || '#82C0CC';
}

export default WeeklySchedule;
