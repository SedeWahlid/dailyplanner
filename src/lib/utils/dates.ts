import {
  format,
  parseISO,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isToday,
  isTomorrow,
  isYesterday,
  differenceInDays,
  isBefore,
} from 'date-fns'

export function formatDate(date: string | Date, fmt = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt)
}

export function formatTime(time: string | null): string {
  if (!time) return ''
  const [h, m] = time.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${m} ${ampm}`
}

export function getRelativeDateLabel(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'EEE, MMM d')
}

export function getDateRange(view: 'day' | 'week' | 'month', date: Date = new Date()) {
  switch (view) {
    case 'day':
      return { start: startOfDay(date), end: endOfDay(date) }
    case 'week':
      return { start: startOfWeek(date, { weekStartsOn: 1 }), end: endOfWeek(date, { weekStartsOn: 1 }) }
    case 'month':
      return { start: startOfMonth(date), end: endOfMonth(date) }
  }
}

export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  return isBefore(parseISO(dueDate), startOfDay(new Date()))
}

export function daysUntil(dueDate: string): number {
  return differenceInDays(parseISO(dueDate), startOfDay(new Date()))
}

export function formatTimeBlock(start: string | null, end: string | null): string {
  if (!start && !end) return ''
  const s = start ? formatTime(start) : ''
  const e = end ? formatTime(end) : ''
  return `${s}${s && e ? ' - ' : ''}${e}`
}

export function today(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function nowISO(): string {
  return new Date().toISOString()
}
