'use client'

import { useState } from 'react'
import { useCreateTask, useUpdateTask } from '@/lib/hooks/use-tasks'
import { useCategories } from '@/lib/hooks/use-categories'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { PRIORITY_LABELS } from '@/lib/types/database'
import type { Task } from '@/lib/types/database'

interface TaskFormProps {
  task?: Task | null
  open: boolean
  onClose: () => void
}

export function TaskForm({ task, open, onClose }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [priority, setPriority] = useState(String(task?.priority || 0))
  const [dueDate, setDueDate] = useState(task?.due_date || '')
  const [dueTime, setDueTime] = useState(task?.due_time || '')
  const [startTime, setStartTime] = useState(task?.start_time || '')
  const [endTime, setEndTime] = useState(task?.end_time || '')
  const [categoryId, setCategoryId] = useState(task?.category_id || '')
  const [isRecurring, setIsRecurring] = useState(task?.is_recurring || false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [recurrenceRule, setRecurrenceRule] = useState(task?.recurrence_rule || '')
  const [error, setError] = useState('')

  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const { data: categories } = useCategories()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    const data = {
      title: title.trim(),
      description: description.trim() || null,
      priority: Number(priority),
      due_date: dueDate || null,
      due_time: dueTime || null,
      start_time: startTime || null,
      end_time: endTime || null,
      category_id: categoryId || null,
      is_recurring: isRecurring,
      recurrence_rule: recurrenceRule || null,
    }

    try {
      if (task) {
        await updateTask.mutateAsync({ id: task.id, ...data })
      } else {
        await createTask.mutateAsync(data)
      }
      onClose()
    } catch {
      setError('Failed to save task')
    }
  }

  const isLoading = createTask.isPending || updateTask.isPending

  const categoryOptions = categories?.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` })) || []
  const priorityOptions = Object.entries(PRIORITY_LABELS).map(([v, l]) => ({ value: v, label: l }))

  return (
    <Modal open={open} onClose={onClose} title={task ? 'Edit Task' : 'New Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          required
          autoFocus
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Add details..."
            className="block w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 shadow-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <Input label="Due Time" type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Start Time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <Input label="End Time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={priorityOptions}
          />
          <Select
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            options={categoryOptions}
            placeholder="None"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="recurring"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-800"
          />
          <label htmlFor="recurring" className="text-sm text-gray-700 dark:text-slate-300">Recurring task</label>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">{error}</div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isLoading}>{task ? 'Update' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  )
}
