'use client'

import { useTasks } from '@/lib/hooks/use-tasks'
import { getRelativeDateLabel, isOverdue } from '@/lib/utils/dates'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Calendar, AlertCircle } from 'lucide-react'
import { addDays, format } from 'date-fns'

export function UpcomingTasks() {
  const { data: tasks, isLoading } = useTasks()

  if (isLoading) {
    return (
      <Card className="p-4">
        <Skeleton className="h-5 w-32 mb-3" />
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </Card>
    )
  }

  const today = format(new Date(), 'yyyy-MM-dd')
  const weekEnd = format(addDays(new Date(), 7), 'yyyy-MM-dd')

  const upcoming = tasks
    ?.filter((t) => !t.completed && t.due_date && t.due_date >= today && t.due_date <= weekEnd)
    .sort((a, b) => (a.due_date! > b.due_date! ? 1 : -1))

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm">Upcoming Tasks</h3>
      </div>

      {upcoming?.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-8">No upcoming tasks this week</p>
      ) : (
        <div className="space-y-1">
          {upcoming?.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-slate-100 truncate">{task.title}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500">
                  {getRelativeDateLabel(task.due_date!)}
                  {isOverdue(task.due_date) && (
                    <span className="text-red-500 ml-1 inline-flex items-center gap-0.5">
                      <AlertCircle className="h-3 w-3" /> Overdue
                    </span>
                  )}
                </p>
              </div>
              {task.category && (
                <div className="shrink-0">
                  <Badge>
                    <span className="mr-1">{task.category.icon}</span>
                    {task.category.name}
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
