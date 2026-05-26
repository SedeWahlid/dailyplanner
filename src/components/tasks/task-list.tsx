'use client'

import { useTasks } from '@/lib/hooks/use-tasks'
import { useAppStore } from '@/lib/stores/app-store'
import { useCategories } from '@/lib/hooks/use-categories'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TaskCard } from './task-card'
import { TaskForm } from './task-form'
import { Plus, Search, X } from 'lucide-react'
import { useState, useMemo } from 'react'
import { PRIORITY_LABELS } from '@/lib/types/database'

export function TaskList() {
  const { data: tasks, isLoading } = useTasks()
  const { data: categories } = useCategories()
  const { taskFilters, setTaskFilter, resetTaskFilters } = useAppStore()
  const [creating, setCreating] = useState(false)

  const filteredTasks = useMemo(() => {
    if (!tasks) return []
    return tasks.filter((task) => {
      if (taskFilters.categoryId && task.category_id !== taskFilters.categoryId) return false
      if (taskFilters.priority !== null && task.priority !== taskFilters.priority) return false
      if (!taskFilters.showCompleted && task.completed) return false
      if (taskFilters.search) {
        const q = taskFilters.search.toLowerCase()
        if (!task.title.toLowerCase().includes(q) && !(task.description?.toLowerCase().includes(q))) return false
      }
      return true
    }).sort((a, b) => {
      const dir = taskFilters.sortOrder === 'asc' ? 1 : -1
      switch (taskFilters.sortBy) {
        case 'due_date':
          return dir * ((a.due_date || '') > (b.due_date || '') ? 1 : -1)
        case 'priority':
          return dir * (b.priority - a.priority)
        case 'title':
          return dir * a.title.localeCompare(b.title)
        default:
          return dir * (new Date(a.created_at) > new Date(b.created_at) ? 1 : -1)
      }
    })
  }, [tasks, taskFilters])

  const hasFilters = taskFilters.categoryId || taskFilters.priority !== null || taskFilters.search || taskFilters.showCompleted

  const categoryOptions = categories?.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` })) || []
  const priorityOptions = Object.entries(PRIORITY_LABELS).map(([v, l]) => ({ value: v, label: l }))
  const sortOptions = [
    { value: 'due_date', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'title', label: 'Title' },
    { value: 'created_at', label: 'Created' },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
          <input
            value={taskFilters.search}
            onChange={(e) => setTaskFilter('search', e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 placeholder:text-gray-400 dark:placeholder:text-slate-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={taskFilters.categoryId || ''}
            onChange={(e) => setTaskFilter('categoryId', e.target.value || null)}
            options={categoryOptions}
            placeholder="All categories"
            className="w-full sm:w-44"
          />
          <Select
            value={taskFilters.priority !== null ? String(taskFilters.priority) : ''}
            onChange={(e) => setTaskFilter('priority', e.target.value ? Number(e.target.value) : null)}
            options={priorityOptions}
            placeholder="All priorities"
            className="w-full sm:w-36"
          />
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Task</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={taskFilters.showCompleted}
            onChange={(e) => setTaskFilter('showCompleted', e.target.checked)}
            className="rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-800"
          />
          Show completed
        </label>

        <div className="flex items-center gap-1 ml-auto">
          <span className="text-xs text-gray-400 dark:text-slate-500 mr-1">Sort:</span>
          <select
            value={taskFilters.sortBy}
            onChange={(e) => setTaskFilter('sortBy', e.target.value as typeof taskFilters.sortBy)}
            className="text-xs border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded px-2 py-1"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => setTaskFilter('sortOrder', taskFilters.sortOrder === 'asc' ? 'desc' : 'asc')}
            className="text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 px-2 py-1 border border-gray-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
          >
            {taskFilters.sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-400 dark:text-slate-500">{filteredTasks.length} results</span>
          <Button variant="ghost" size="sm" onClick={resetTaskFilters}>
            <X className="h-3 w-3" /> Clear filters
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/4 mt-2" />
            </Card>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 dark:text-slate-500 text-sm">No tasks found</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Create your first task
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      <TaskForm open={creating} onClose={() => setCreating(false)} />
    </div>
  )
}
