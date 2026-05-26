import { TaskList } from "@/components/tasks/task-list"

export default function TasksPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">Tasks</h1>
      <TaskList />
    </div>
  )
}
