'use client'

import { useGoals } from '@/lib/hooks/use-goals'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Target, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { GOAL_STATUSES } from '@/lib/types/database'
import { clsx } from 'clsx'

export function GoalsOverview() {
  const { data: goals, isLoading } = useGoals()

  if (isLoading) {
    return (
      <Card className="p-4">
        <Skeleton className="h-5 w-32 mb-3" />
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </Card>
    )
  }

  const activeGoals = goals?.filter((g) => g.status === 'active').slice(0, 3) ?? []

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm">Active Goals</h3>
        </div>
        <Link href="/goals" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 shrink-0">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {activeGoals.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-6">
          No active goals yet
        </p>
      ) : (
        <div className="space-y-3">
          {activeGoals.map((goal) => {
            const statusStyle = GOAL_STATUSES.find((s) => s.value === goal.status)
            const milestones = goal.milestones || []
            const completedMilestones = milestones.filter((m) => m.completed).length
            const pct = Math.round(goal.progress || 0)

            return (
              <div key={goal.id} className="group">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{goal.title}</p>
                    {milestones.length > 0 && (
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                        {completedMilestones}/{milestones.length} milestones
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">{pct}%</span>
                </div>
                <Progress
                  value={pct}
                  color={pct >= 100 ? 'bg-green-500' : 'bg-indigo-600'}
                  size="sm"
                />
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
