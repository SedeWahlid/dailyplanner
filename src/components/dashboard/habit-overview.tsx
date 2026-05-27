'use client'

import { useHabits, useTodayHabitLogs, useHabitStreaks } from '@/lib/hooks/use-habits'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Activity, Flame } from 'lucide-react'
import { clsx } from 'clsx'

export function HabitOverview() {
  const { data: habits, isLoading: habitsLoading } = useHabits()
  const { data: logs, isLoading: logsLoading } = useTodayHabitLogs()
  const { data: streaks, isLoading: streaksLoading } = useHabitStreaks(60)

  const isLoading = habitsLoading || logsLoading || streaksLoading

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm">Today&apos;s Habits</h3>
        </div>
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

          <div className="mt-3 space-y-0.5">
            {habits?.slice(0, 5).map((habit) => {
              const log = logsMap.get(habit.id)
              const streak = streaks?.[habit.id]
              const isCompleted = log?.completed || false

              return (
                <div
                  key={habit.id}
                  className={clsx(
                    'flex items-center gap-3 px-2 py-2 rounded-lg transition-colors',
                    isCompleted
                      ? 'bg-green-50/50 dark:bg-green-900/10'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                  )}
                >
                  <div
                    className={clsx(
                      'w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-bold transition-all',
                      isCompleted
                        ? 'bg-green-500 shadow-sm shadow-green-200 dark:shadow-green-900/30'
                        : 'bg-gray-200 dark:bg-slate-600'
                    )}
                    style={isCompleted ? {} : { backgroundColor: habit.color + '40' }}
                  >
                    {isCompleted ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-[10px] opacity-60">{habit.icon}</span>
                    )}
                  </div>

                  <span
                    className={clsx(
                      'text-sm flex-1 truncate',
                      isCompleted
                        ? 'text-gray-800 dark:text-slate-200 font-medium'
                        : 'text-gray-600 dark:text-slate-400'
                    )}
                  >
                    {habit.name}
                  </span>

                  {streak && streak.current > 0 && (
                    <span className="flex items-center gap-0.5 text-xs font-medium text-orange-500 dark:text-orange-400 shrink-0">
                      <Flame className="h-3.5 w-3.5" />
                      {streak.current}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </Card>
  )
}
