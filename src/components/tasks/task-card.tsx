'use client'

import { useState } from 'react'
import type { Task } from '@/lib/types/database'
import { useToggleTask, useDeleteTask } from '@/lib/hooks/use-tasks'
import { formatTimeBlock, getRelativeDateLabel, isOverdue, formatTime } from '@/lib/utils/dates'
import { PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/types/database'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TaskForm } from './task-form'
import { Check, Clock, ChevronRight, Trash2, Edit3, Calendar } from 'lucide-react'
import { clsx } from 'clsx'

interface TaskCardProps {
  task: Task & { category?: Task['category'] }
  onClick?: () => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const [editing, setEditing] = useState(false)
  const toggleTask = useToggleTask()
  const deleteTask = useDeleteTask()

  const handleToggle = () => {
    toggleTask.mutate({ id: task.id, completed: !task.completed })
  }

  const handleDelete = () => {
    if (confirm('Delete this task?')) {
      deleteTask.mutate(task.id)
    }
  }

  const timeBlock = formatTimeBlock(task.start_time, task.end_time)

  return (
    <>
      <div
        className={clsx(
          'group flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl transition-all',
          task.completed ? 'opacity-60' : 'hover:shadow-sm dark:hover:shadow-slate-900/30 hover:border-gray-300 dark:hover:border-slate-600',
          onClick && 'cursor-pointer'
        )}
        onClick={onClick}
      >
        <button
          onClick={(e) => { e.stopPropagation(); handleToggle(); }}
          className={clsx(
            'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
            task.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 dark:border-slate-500 hover:border-green-400'
          )}
        >
          {task.completed && <Check className="h-3 w-3" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={clsx('text-sm font-medium', task.completed ? 'text-gray-400 dark:text-slate-500 line-through' : 'text-gray-900 dark:text-slate-100')}>
              {task.title}
            </p>
            {task.priority === 3 && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {task.due_date && (
              <span className={clsx('text-xs flex items-center gap-1', isOverdue(task.due_date) && !task.completed ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-slate-500')}>
                <Calendar className="h-3 w-3" />
                {getRelativeDateLabel(task.due_date)}
                {task.due_time && ` at ${formatTime(task.due_time)}`}
              </span>
            )}
            {timeBlock && (
              <span className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeBlock}
              </span>
            )}
            {task.category && (
              <Badge>
                <span className="mr-1">{task.category.icon}</span>
                {task.category.name}
              </Badge>
            )}
            {task.priority > 0 && (
              <Badge className={PRIORITY_COLORS[task.priority]}>
                {PRIORITY_LABELS[task.priority]}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setEditing(true); }}>
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(); }}>
            <Trash2 className="h-3.5 w-3.5 text-red-500" />
          </Button>
        </div>

        {onClick && <ChevronRight className="h-4 w-4 text-gray-300 dark:text-slate-600 shrink-0" />}
      </div>

      <TaskForm task={task} open={editing} onClose={() => setEditing(false)} />
    </>
  )
}
