'use client'

import { useHabits, useTodayHabitLogs } from '@/lib/hooks/use-habits'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Activity } from 'lucide-react'
import { clsx } from 'clsx'

export function HabitOverview() {
  const { data: habits, isLoading: habitsLoading } = useHabits()
  const { data: logs, isLoading: logsLoading } = useTodayHabitLogs()

  const isLoading = habitsLoading || logsLoading

  if (isLoading) {
    return (
      <Card className="p-4">
        <Skeleton className="h-5 w-36 mb-3" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
    )
  }

  const logsMap = new Map(logs?.map((l) => [l.habit_id, l]))

  const completed = habits?.filter((h) => logsMap.get(h.id)?.completed).length ?? 0
  const total = habits?.length ?? 0
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm">Today&apos;s Habits</h3>
      </div>

      {habits?.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-6">No habits created yet</p>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 dark:text-slate-400">{completed} of {total} completed</span>
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{percent}%</span>
          </div>
          <Progress value={percent} color={percent === 100 ? 'bg-green-500' : 'bg-indigo-600'} size="md" />
          <div className="mt-3 space-y-1">
            {habits?.slice(0, 5).map((habit) => {
              const log = logsMap.get(habit.id)
              return (
                <div key={habit.id} className="flex items-center gap-2 px-2 py-1">
                  <div
                    className={clsx(
                      'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0',
                      log?.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 dark:border-slate-600'
                    )}
                  >
                    {log?.completed && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-slate-400 truncate">{habit.name}</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </Card>
  )
}
