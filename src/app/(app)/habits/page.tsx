'use client'

import { useState, useMemo } from 'react'
import { useHabits, useTodayHabitLogs, useHabitWeekLogs, useHabitStreaks, useCreateHabit, useUpdateHabit, useDeleteHabit, useToggleHabit } from '@/lib/hooks/use-habits'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select } from '@/components/ui/select'
import { Plus, Check, Trash2, Edit3, Archive, Flame, Sparkles } from 'lucide-react'
import { today, formatDate } from '@/lib/utils/dates'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import type { Habit, HabitLog } from '@/lib/types/database'

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

const COLOR_OPTIONS = [
  { value: '#22c55e', label: 'Green' },
  { value: '#6366f1', label: 'Indigo' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#ef4444', label: 'Red' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#8b5cf6', label: 'Purple' },
]

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function getLast7Days(): { date: string; label: string }[] {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    days.push({ date: dateStr, label: DAY_LABELS[6 - i] })
  }
  return days
}

function HabitForm({
  habit,
  open,
  onClose,
}: {
  habit?: Habit | null
  open: boolean
  onClose: () => void
}) {
  const [name, setName] = useState(habit?.name || '')
  const [description, setDescription] = useState(habit?.description || '')
  const [frequency, setFrequency] = useState<Habit['frequency']>(habit?.frequency || 'daily')
  const [targetCount, setTargetCount] = useState(String(habit?.target_count || 1))
  const [color, setColor] = useState(habit?.color || '#22c55e')
  const [icon, setIcon] = useState(habit?.icon || '✅')

  const createHabit = useCreateHabit()
  const updateHabit = useUpdateHabit()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const data = {
      name: name.trim(),
      description: description.trim() || null,
      frequency: frequency as 'daily' | 'weekly' | 'monthly',
      target_count: Number(targetCount),
      color,
      icon,
    }

    if (habit) {
      await updateHabit.mutateAsync({ id: habit.id, ...data })
    } else {
      await createHabit.mutateAsync(data)
    }
    onClose()
  }

  const isLoading = createHabit.isPending || updateHabit.isPending

  const POPULAR_ICONS = ['✅', '📚', '🏃', '💧', '🧘', '🎯', '💪', '📝', '🎨', '🧠']

  return (
    <Modal open={open} onClose={onClose} title={habit ? 'Edit Habit' : 'New Habit'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Read 30 minutes" required autoFocus />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select label="Frequency" value={frequency} onChange={(e) => setFrequency(e.target.value as Habit['frequency'])} options={FREQUENCY_OPTIONS} />
          <Input label="Times per day" type="number" min={1} max={99} value={targetCount} onChange={(e) => setTargetCount(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Color</label>
          <div className="flex gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={clsx(
                  'w-8 h-8 rounded-full border-2 transition-all',
                  color === c.value ? 'border-gray-900 dark:border-white scale-110 shadow-md' : 'border-transparent hover:scale-105'
                )}
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Icon</label>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_ICONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                className={clsx(
                  'w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all border-2',
                  icon === emoji
                    ? 'border-indigo-500 bg-indigo-50 scale-110 dark:border-indigo-400 dark:bg-indigo-900/30'
                    : 'border-gray-200 hover:border-gray-300 dark:border-slate-700 dark:hover:border-slate-600'
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isLoading}>{habit ? 'Update' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  )
}

function StreakBadge({ current, longest }: { current: number; longest: number }) {
  const isMilestone = [7, 14, 21, 30, 50, 60, 90, 100, 180, 365].includes(current) && current > 0

  if (current === 0 && longest === 0) return null

  return (
    <div className="flex items-center gap-1.5" title={`${current} day streak · Best: ${longest}`}>
      <motion.span
        className={clsx(
          'flex items-center gap-0.5 text-xs font-semibold',
          current > 0 ? 'text-orange-500 dark:text-orange-400' : 'text-gray-300 dark:text-slate-600'
        )}
        animate={isMilestone ? { scale: [1, 1.3, 1] } : {}}
        transition={{ repeat: 3, duration: 0.5 }}
      >
        <Flame
          className={clsx(
            'h-4 w-4',
            isMilestone && 'drop-shadow-[0_0_4px_rgba(251,146,60,0.6)]'
          )}
          style={{
            fill: current > 0 ? '#f97316' : 'none',
            stroke: current > 0 ? '#f97316' : 'currentColor',
            strokeWidth: 2,
          }}
        />
        {current}
      </motion.span>
    </div>
  )
}

function WeeklyTracker({
  weekLogs,
  color,
}: {
  weekLogs: { date: string; label: string; completed: boolean }[]
  color: string
}) {
  const reversed = [...weekLogs].reverse()

  return (
    <div className="flex gap-1">
      {reversed.map((day) => (
        <div
          key={day.date}
          className="flex flex-col items-center gap-0.5"
          title={`${day.date}: ${day.completed ? 'Completed' : 'Missed'}`}
        >
          <div
            className={clsx(
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all',
              day.completed
                ? 'text-white shadow-sm'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500'
            )}
            style={day.completed ? { backgroundColor: color } : {}}
          >
            {day.completed ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <span className="text-[10px]">{day.label}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function HabitCard({
  habit,
  todayLog,
  streak,
  weekLogs,
}: {
  habit: Habit
  todayLog: HabitLog | undefined
  streak: { current: number; longest: number } | undefined
  weekLogs: { date: string; label: string; completed: boolean }[] | undefined
}) {
  const [editing, setEditing] = useState(false)
  const toggleHabit = useToggleHabit()
  const deleteHabit = useDeleteHabit()
  const updateHabit = useUpdateHabit()

  const isCompleted = todayLog?.completed || false

  const handleToggle = () => {
    toggleHabit.mutate({
      habitId: habit.id,
      date: today(),
      completed: !isCompleted,
      count: isCompleted ? 0 : habit.target_count,
    })
  }

  const handleArchive = () => {
    updateHabit.mutate({ id: habit.id, archived: true })
  }

  const handleDelete = () => {
    if (confirm('Delete this habit?')) {
      deleteHabit.mutate(habit.id)
    }
  }

  const s = streak || { current: 0, longest: 0 }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex">
            <div className="w-1 shrink-0 rounded-l-xl" style={{ backgroundColor: habit.color }} />

            <div className="flex-1 p-4">
              <div className="flex items-start gap-3">
                <motion.button
                  onClick={handleToggle}
                  whileTap={{ scale: 0.9 }}
                  className={clsx(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white transition-all',
                    isCompleted
                      ? 'shadow-md'
                      : 'opacity-70 hover:opacity-100'
                  )}
                  style={{ backgroundColor: isCompleted ? habit.color : habit.color + '50' }}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-lg">{habit.icon}</span>
                  )}
                </motion.button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className={clsx(
                        'font-semibold text-sm',
                        isCompleted
                          ? 'text-gray-900 dark:text-slate-100'
                          : 'text-gray-700 dark:text-slate-300'
                      )}>
                        {habit.name}
                      </h3>
                      {habit.description && (
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 line-clamp-1">{habit.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <StreakBadge current={s.current} longest={s.longest} />
                      <div className="flex items-center gap-0.5">
                        <Button variant="ghost" size="icon" onClick={() => setEditing(true)} className="h-7 w-7">
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleArchive} className="h-7 w-7">
                          <Archive className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleDelete} className="h-7 w-7">
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <Badge className="capitalize text-[11px] px-2 py-0.5">{habit.frequency}</Badge>
                      <span className="text-[11px] text-gray-400 dark:text-slate-500">Target: {habit.target_count}x/day</span>
                    </div>
                    {weekLogs && (
                      <div>
                        <WeeklyTracker weekLogs={weekLogs} color={habit.color} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {editing && <HabitForm habit={habit} open={editing} onClose={() => setEditing(false)} />}
    </>
  )
}

export default function HabitsPage() {
  const { data: habits, isLoading } = useHabits()
  const { data: todayLogs } = useTodayHabitLogs()
  const { data: weekLogs } = useHabitWeekLogs()
  const { data: streaks } = useHabitStreaks()
  const [creating, setCreating] = useState(false)

  const todayLogsMap = useMemo(
    () => new Map(todayLogs?.map((l) => [l.habit_id, l])),
    [todayLogs]
  )

  const last7 = useMemo(() => getLast7Days(), [])

  function getWeekData(habitId: string) {
    if (!weekLogs) return undefined
    const habitWeekLogs = weekLogs.filter((l) => l.habit_id === habitId)
    return last7.map((day) => ({
      ...day,
      completed: habitWeekLogs.some((l) => l.log_date === day.date && l.completed),
    }))
  }

  const completedToday = habits?.filter((h) => todayLogsMap.get(h.id)?.completed).length ?? 0
  const totalHabits = habits?.length ?? 0
  const allDone = totalHabits > 0 && completedToday === totalHabits

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Habits</h1>
          {totalHabits > 0 && (
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              {allDone ? (
                <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> All done for today!
                </span>
              ) : (
                <span>{completedToday} of {totalHabits} completed today</span>
              )}
            </p>
          )}
        </div>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> New Habit
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3 w-60" />
                  <div className="flex justify-between items-center mt-4">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-7 w-48" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : habits?.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-1">Start Building Habits</h2>
          <p className="text-sm text-gray-400 dark:text-slate-500 mb-5 max-w-sm mx-auto">
            Create daily habits, track your streaks, and build consistency over time.
          </p>
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Create your first habit
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {habits?.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                todayLog={todayLogsMap.get(habit.id)}
                streak={streaks?.[habit.id]}
                weekLogs={getWeekData(habit.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {creating && <HabitForm open={creating} onClose={() => setCreating(false)} />}
    </div>
  )
}
