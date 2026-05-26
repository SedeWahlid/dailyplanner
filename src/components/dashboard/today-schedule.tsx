'use client'

import { useTodayTasks } from '@/lib/hooks/use-tasks'
import { formatTimeBlock, isOverdue } from '@/lib/utils/dates'
import { PRIORITY_COLORS } from '@/lib/types/database'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { parseISO, compareAsc } from 'date-fns'

export function TodaySchedule() {
  const { data: tasks, isLoading } = useTodayTasks()

  if (isLoading) {
    return (
      <Card className="p-4">
        <Skeleton className="h-5 w-32 mb-3" />
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </Card>
    )
  }

  const sorted = tasks
    ? [...tasks].sort((a, b) => {
        if (!a.start_time && !b.start_time) return 0
        if (!a.start_time) return 1
        if (!b.start_time) return -1
        return compareAsc(parseISO(`2000-01-01T${a.start_time}`), parseISO(`2000-01-01T${b.start_time}`))
      })
    : []

  const incomplete = sorted?.filter((t) => !t.completed) ?? []
  const completed = sorted?.filter((t) => t.completed) ?? []

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm">Today&apos;s Schedule</h3>
      </div>

      {sorted?.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-8">No tasks scheduled for today</p>
      ) : (
        <div className="space-y-1">
          {incomplete.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className={`w-1.5 h-1.5 rounded-full ${task.priority === 3 ? 'bg-red-500' : task.priority === 2 ? 'bg-yellow-500' : 'bg-blue-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-slate-100 truncate">{task.title}</p>
                {task.description && <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{task.description}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {task.start_time && (
                  <span className="text-xs text-gray-400 dark:text-slate-500">{formatTimeBlock(task.start_time, task.end_time)}</span>
                )}
                {isOverdue(task.due_date) && (
                  <Badge variant="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"><AlertCircle className="h-3 w-3" /></Badge>
                )}
                {task.priority > 0 && (
                  <Badge className={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
                )}
              </div>
            </div>
          ))}
          {completed.length > 0 && (
            <div className="border-t border-gray-200 dark:border-slate-700 pt-2 mt-2">
              <p className="text-xs text-gray-400 dark:text-slate-500 mb-1 px-3">Completed ({completed.length})</p>
              {completed.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center gap-3 px-3 py-1.5 text-gray-400 dark:text-slate-500">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm line-through truncate">{task.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
