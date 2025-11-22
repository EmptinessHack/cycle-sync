export type CyclePhase = 'Menstrual' | 'Follicular' | 'Ovulatory' | 'Luteal';

export interface Task {
  id: string;
  title: string;
  category: string;
  isFixed: boolean;
  duration: string; // Format: "HH:MM"
  date?: string; // For fixed tasks
  startTime?: string; // For fixed tasks
  endTime?: string; // For fixed tasks
  deadline?: string; // For flexible tasks
  repeatsWeekly?: boolean;
  isProject?: boolean;
}

export interface ScheduledTask {
  id: string;
  taskId: string;
  title: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  phase: CyclePhase;
  energyLevel: 'high' | 'medium' | 'low';
  isProject?: boolean;
  repeats?: boolean;
}

export interface UserData {
  cycleDay: number;
  tasks: Task[];
  schedule: ScheduledTask[];
}
