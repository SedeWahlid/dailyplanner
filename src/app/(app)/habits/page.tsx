'use client'

import { useState } from 'react'
import { useHabits, useTodayHabitLogs, useCreateHabit, useUpdateHabit, useDeleteHabit, useToggleHabit } from '@/lib/hooks/use-habits'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select } from '@/components/ui/select'
import { Plus, Check, Trash2, Edit3, Archive, Flame } from 'lucide-react'
import { today } from '@/lib/utils/dates'
import { clsx } from 'clsx'
import type { Habit } from '@/lib/types/database'

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
    }

    if (habit) {
      await updateHabit.mutateAsync({ id: habit.id, ...data })
    } else {
      await createHabit.mutateAsync(data)
    }
    onClose()
  }

  const isLoading = createHabit.isPending || updateHabit.isPending

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
                className={clsx('w-8 h-8 rounded-full border-2 transition-all', color === c.value ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent')}
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
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

function HabitCard({ habit }: { habit: Habit }) {
  const { data: logs } = useTodayHabitLogs()
  const [editing, setEditing] = useState(false)
  const toggleHabit = useToggleHabit()
  const deleteHabit = useDeleteHabit()
  const updateHabit = useUpdateHabit()

  const todayLog = logs?.find((l) => l.habit_id === habit.id)
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

  return (
    <>
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <button
            onClick={handleToggle}
            className={clsx(
              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white transition-all',
              isCompleted ? 'ring-2 ring-offset-1' : 'opacity-70 hover:opacity-100'
            )}
            style={{ backgroundColor: habit.color }}
          >
            <Check className={clsx('h-5 w-5 transition-transform', isCompleted && 'scale-110')} />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-slate-100 text-sm">{habit.name}</h3>
                {habit.description && <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{habit.description}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => setEditing(true)}>
                  <Edit3 className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleArchive}>
                  <Archive className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleDelete}>
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <Badge className="capitalize text-xs">{habit.frequency}</Badge>
              <span className="text-xs text-gray-400 dark:text-slate-500">Target: {habit.target_count}x/day</span>
              <span className="text-xs text-orange-500 dark:text-orange-400 flex items-center gap-0.5">
                <Flame className="h-3 w-3" />
                {/* Streaks would require more complex query; placeholder for now */}
                0
              </span>
            </div>
          </div>
        </div>
      </Card>

      <HabitForm habit={habit} open={editing} onClose={() => setEditing(false)} />
    </>
  )
}

export default function HabitsPage() {
  const { data: habits, isLoading } = useHabits()
  const [creating, setCreating] = useState(false)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Habits</h1>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> New Habit
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-5 w-40 mt-2" />
            </Card>
          ))}
        </div>
      ) : habits?.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 dark:text-slate-500 text-sm">No habits yet</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Create your first habit
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {habits?.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      )}

      <HabitForm open={creating} onClose={() => setCreating(false)} />
    </div>
  )
}
