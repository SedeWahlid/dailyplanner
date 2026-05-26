export const APP_NAME = 'DailyPlanner'
export const APP_DESCRIPTION = 'Your all-in-one daily planner and productivity companion'

export const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/calendar', label: 'Calendar', icon: 'Calendar' },
  { href: '/tasks', label: 'Tasks', icon: 'CheckSquare' },
  { href: '/habits', label: 'Habits', icon: 'Activity' },
  { href: '/notes', label: 'Notes', icon: 'FileText' },
  { href: '/goals', label: 'Goals', icon: 'Target' },
  { href: '/settings', label: 'Settings', icon: 'Settings' },
] as const

export const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0')
  return `${hour}:00`
})

export const DEFAULT_CATEGORIES = [
  { name: 'Work', color: '#6366f1', icon: '💼', sort_order: 0 },
  { name: 'Personal', color: '#22c55e', icon: '👤', sort_order: 1 },
  { name: 'Health', color: '#ef4444', icon: '❤️', sort_order: 2 },
  { name: 'Learning', color: '#f59e0b', icon: '📚', sort_order: 3 },
  { name: 'Errands', color: '#8b5cf6', icon: '🏃', sort_order: 4 },
]
