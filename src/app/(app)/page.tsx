import { TodaySchedule } from "@/components/dashboard/today-schedule"
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks"
import { HabitOverview } from "@/components/dashboard/habit-overview"
import { QuickNote } from "@/components/dashboard/quick-note"

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">Good morning 👋</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TodaySchedule />
          <UpcomingTasks />
        </div>
        <div className="space-y-6">
          <HabitOverview />
          <QuickNote />
        </div>
      </div>
    </div>
  )
}
