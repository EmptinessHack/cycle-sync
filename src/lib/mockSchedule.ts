// Mock schedule data for WeeklySchedule screen
// Future: this will be replaced by real backend/Oasis result

export type ScheduledTask = {
  id: string;
  title: string;
  category: string;        // e.g. "Entrepreneur", "Home", "Mother"
  date: string;            // ISO date, e.g. "2025-10-23"
  startTime: string;       // "09:00"
  endTime: string;         // "11:00"
  energyType: "deep-work" | "admin" | "social" | "rest";
  cycleDay: number;
  cyclePhase: "Menstrual" | "Follicular" | "Ovulatory" | "Luteal";
};

/**
 * Returns a hard-coded array of scheduled tasks for one week
 * This simulates the processed schedule from Oasis backend
 */
export function getMockSchedule(currentCycleDay: number = 6): ScheduledTask[] {
  const today = new Date();
  const tasks: ScheduledTask[] = [];
  
  // Helper to get cycle phase from day
  const getPhase = (day: number): ScheduledTask['cyclePhase'] => {
    if (day >= 1 && day <= 5) return 'Menstrual';
    if (day >= 6 && day <= 13) return 'Follicular';
    if (day >= 14 && day <= 17) return 'Ovulatory';
    return 'Luteal';
  };
  
  // Generate tasks for the next 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const cycleDay = ((currentCycleDay + i - 1) % 28) + 1;
    const phase = getPhase(cycleDay);
    
    // Day 1 (Monday) - Deep work focus
    if (i === 0) {
      tasks.push({
        id: `task-${i}-1`,
        title: 'Deep work block for grant writing',
        category: 'Entrepreneur',
        date: dateStr,
        startTime: '09:00',
        endTime: '11:00',
        energyType: 'deep-work',
        cycleDay,
        cyclePhase: phase,
      });
      tasks.push({
        id: `task-${i}-2`,
        title: 'Client proposal review',
        category: 'Entrepreneur',
        date: dateStr,
        startTime: '14:00',
        endTime: '15:30',
        energyType: 'admin',
        cycleDay,
        cyclePhase: phase,
      });
    }
    
    // Day 2 - Mix of work
    if (i === 1) {
      tasks.push({
        id: `task-${i}-1`,
        title: 'Team standup meeting',
        category: 'Entrepreneur',
        date: dateStr,
        startTime: '10:00',
        endTime: '10:30',
        energyType: 'social',
        cycleDay,
        cyclePhase: phase,
      });
      tasks.push({
        id: `task-${i}-2`,
        title: 'Product roadmap planning',
        category: 'Entrepreneur',
        date: dateStr,
        startTime: '11:00',
        endTime: '13:00',
        energyType: 'deep-work',
        cycleDay,
        cyclePhase: phase,
      });
    }
    
    // Day 3 - Admin and home tasks
    if (i === 2) {
      tasks.push({
        id: `task-${i}-1`,
        title: 'Invoice processing',
        category: 'Entrepreneur',
        date: dateStr,
        startTime: '09:30',
        endTime: '10:30',
        energyType: 'admin',
        cycleDay,
        cyclePhase: phase,
      });
      tasks.push({
        id: `task-${i}-2`,
        title: 'Grocery shopping',
        category: 'Home',
        date: dateStr,
        startTime: '15:00',
        endTime: '16:00',
        energyType: 'admin',
        cycleDay,
        cyclePhase: phase,
      });
    }
    
    // Day 4 - Social and networking
    if (i === 3) {
      tasks.push({
        id: `task-${i}-1`,
        title: 'Coffee chat with mentor',
        category: 'Entrepreneur',
        date: dateStr,
        startTime: '10:00',
        endTime: '11:30',
        energyType: 'social',
        cycleDay,
        cyclePhase: phase,
      });
      tasks.push({
        id: `task-${i}-2`,
        title: 'Networking event prep',
        category: 'Entrepreneur',
        date: dateStr,
        startTime: '14:00',
        endTime: '15:00',
        energyType: 'social',
        cycleDay,
        cyclePhase: phase,
      });
    }
    
    // Day 5 - Deep work
    if (i === 4) {
      tasks.push({
        id: `task-${i}-1`,
        title: 'Code review and refactoring',
        category: 'Entrepreneur',
        date: dateStr,
        startTime: '09:00',
        endTime: '12:00',
        energyType: 'deep-work',
        cycleDay,
        cyclePhase: phase,
      });
    }
    
    // Day 6 - Rest and light tasks
    if (i === 5) {
      tasks.push({
        id: `task-${i}-1`,
        title: 'Yoga and meditation',
        category: 'Home',
        date: dateStr,
        startTime: '10:00',
        endTime: '11:00',
        energyType: 'rest',
        cycleDay,
        cyclePhase: phase,
      });
      tasks.push({
        id: `task-${i}-2`,
        title: 'Light reading and research',
        category: 'Entrepreneur',
        date: dateStr,
        startTime: '15:00',
        endTime: '16:00',
        energyType: 'rest',
        cycleDay,
        cyclePhase: phase,
      });
    }
    
    // Day 7 - Mixed
    if (i === 6) {
      tasks.push({
        id: `task-${i}-1`,
        title: 'Week planning session',
        category: 'Entrepreneur',
        date: dateStr,
        startTime: '09:00',
        endTime: '10:00',
        energyType: 'admin',
        cycleDay,
        cyclePhase: phase,
      });
      tasks.push({
        id: `task-${i}-2`,
        title: 'Family time',
        category: 'Home',
        date: dateStr,
        startTime: '14:00',
        endTime: '17:00',
        energyType: 'social',
        cycleDay,
        cyclePhase: phase,
      });
    }
  }
  
  return tasks;
}

