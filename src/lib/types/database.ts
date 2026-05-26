export interface Category {
  id: string
  name: string
  color: string
  icon: string
  sort_order: number
  created_at: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  completed: boolean
  priority: number
  due_date: string | null
  due_time: string | null
  start_time: string | null
  end_time: string | null
  category_id: string | null
  is_recurring: boolean
  recurrence_rule: string | null
  sort_order: number
  created_at: string
  updated_at: string
  category?: Category | null
}

export interface Habit {
  id: string
  name: string
  description: string | null
  frequency: 'daily' | 'weekly' | 'monthly'
  target_count: number
  sort_order: number
  color: string
  icon: string
  archived: boolean
  created_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  log_date: string
  count: number
  completed: boolean
}

export interface Note {
  id: string
  title: string | null
  content: string | null
  date: string
  mood: string | null
  pinned: boolean
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  title: string
  description: string | null
  deadline: string | null
  progress: number
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  parent_goal_id: string | null
  sort_order: number
  created_at: string
  updated_at: string
  parent_goal?: Goal | null
  milestones?: Milestone[]
}

export interface Milestone {
  id: string
  goal_id: string
  title: string
  completed: boolean
  due_date: string | null
  completed_at: string | null
  sort_order: number
  created_at: string
}

export interface Reminder {
  id: string
  task_id: string
  remind_at: string
  type: 'app' | 'email' | 'push'
  sent: boolean
  created_at: string
}

export type PriorityLevel = 0 | 1 | 2 | 3

export const PRIORITY_LABELS: Record<number, string> = {
  0: 'None',
  1: 'Low',
  2: 'Medium',
  3: 'High',
}

export const PRIORITY_COLORS: Record<number, string> = {
  0: 'bg-gray-100 text-gray-600',
  1: 'bg-blue-100 text-blue-700',
  2: 'bg-yellow-100 text-yellow-700',
  3: 'bg-red-100 text-red-700',
}

export const MOODS = [
  { value: 'great', label: 'Great', emoji: '😄' },
  { value: 'good', label: 'Good', emoji: '🙂' },
  { value: 'okay', label: 'Okay', emoji: '😐' },
  { value: 'bad', label: 'Bad', emoji: '😟' },
  { value: 'terrible', label: 'Terrible', emoji: '😢' },
] as const

export type Mood = (typeof MOODS)[number]['value']

export const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
] as const

export const GOAL_STATUSES = [
  { value: 'active', label: 'Active', color: 'bg-blue-100 text-blue-700' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
  { value: 'paused', label: 'Paused', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
] as const
