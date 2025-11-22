import { CyclePhase, Task, ScheduledTask } from '../types';

export const getCyclePhase = (day: number): CyclePhase => {
  if (day >= 1 && day <= 5) return 'Menstrual';
  if (day >= 6 && day <= 13) return 'Follicular';
  if (day >= 14 && day <= 17) return 'Ovulatory';
  return 'Luteal';
};

export const getPhaseDescription = (phase: CyclePhase): string => {
  const descriptions = {
    Menstrual: 'Rest & reflect – time for gentle self-care',
    Follicular: 'Energy rising – best for deep work and learning',
    Ovulatory: 'Peak energy – perfect for important meetings and creative work',
    Luteal: 'Winding down – focus on wrapping up and organizing',
  };
  return descriptions[phase];
};

export const getPhaseColor = (phase: CyclePhase): string => {
  const colors = {
    Menstrual: 'var(--color-menstrual)',
    Follicular: 'var(--color-follicular)',
    Ovulatory: 'var(--color-ovulatory)',
    Luteal: 'var(--color-luteal)',
  };
  return colors[phase];
};

// Hook for future AI logic replacement
export const organizeTasksByCyclePhase = (
  cycleDay: number,
  tasks: Task[]
): ScheduledTask[] => {
  const scheduledTasks: ScheduledTask[] = [];
  const today = new Date();
  
  // Get cycle phase
  const currentPhase = getCyclePhase(cycleDay);
  
  // Calculate days in cycle (28 days default)
  const cycleDays = 28;
  
  // Separate fixed and flexible tasks
  const fixedTasks = tasks.filter(t => t.isFixed);
  const flexibleTasks = tasks.filter(t => !t.isFixed);
  
  // Add fixed tasks directly
  fixedTasks.forEach(task => {
    if (task.date && task.startTime && task.endTime) {
      scheduledTasks.push({
        id: `scheduled-${task.id}`,
        taskId: task.id,
        title: task.title,
        category: task.category,
        date: task.date,
        startTime: task.startTime,
        endTime: task.endTime,
        phase: getCyclePhase(cycleDay),
        energyLevel: 'medium',
        isProject: task.isProject,
        repeats: task.repeatsWeekly,
      });
    }
  });
  
  // Organize flexible tasks based on cycle phase
  let dayOffset = 0;
  flexibleTasks.forEach((task, index) => {
    const taskDate = new Date(today);
    taskDate.setDate(today.getDate() + dayOffset);
    
    const taskCycleDay = ((cycleDay + dayOffset - 1) % cycleDays) + 1;
    const taskPhase = getCyclePhase(taskCycleDay);
    
    // Assign energy level based on phase
    let energyLevel: 'high' | 'medium' | 'low';
    let startHour: number;
    
    if (taskPhase === 'Follicular' || taskPhase === 'Ovulatory') {
      energyLevel = 'high';
      startHour = 9; // Morning for high energy tasks
    } else if (taskPhase === 'Luteal') {
      energyLevel = 'medium';
      startHour = 10; // Mid-morning
    } else {
      energyLevel = 'low';
      startHour = 14; // Afternoon for low energy
    }
    
    // Parse duration
    const [hours, minutes] = task.duration.split(':').map(Number);
    const durationMinutes = hours * 60 + minutes;
    
    // Calculate end time
    const startMinutes = startHour * 60 + (index % 3) * 30; // Stagger tasks
    const endMinutes = startMinutes + durationMinutes;
    
    const startTime = `${Math.floor(startMinutes / 60).toString().padStart(2, '0')}:${(startMinutes % 60).toString().padStart(2, '0')}`;
    const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`;
    
    scheduledTasks.push({
      id: `scheduled-${task.id}`,
      taskId: task.id,
      title: task.title,
      category: task.category,
      date: taskDate.toISOString().split('T')[0],
      startTime,
      endTime,
      phase: taskPhase,
      energyLevel,
      isProject: task.isProject,
    });
    
    dayOffset += 1;
    if (dayOffset >= 7) dayOffset = 0; // Cycle through the week
  });
  
  return scheduledTasks.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });
};
