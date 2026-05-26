'use client'

import { useState } from 'react'
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, useCreateMilestone, useUpdateMilestone, useDeleteMilestone, useToggleMilestone } from '@/lib/hooks/use-goals'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select } from '@/components/ui/select'
import { Plus, Target, Trash2, Edit3, Check, ChevronDown, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils/dates'
import { GOAL_STATUSES } from '@/lib/types/database'
import { clsx } from 'clsx'
import type { Goal, Milestone } from '@/lib/types/database'

const STATUS_OPTIONS = GOAL_STATUSES.map((s) => ({ value: s.value, label: s.label }))

function GoalForm({
  goal,
  open,
  onClose,
}: {
  goal?: Goal | null
  open: boolean
  onClose: () => void
}) {
  const [title, setTitle] = useState(goal?.title || '')
  const [description, setDescription] = useState(goal?.description || '')
  const [deadline, setDeadline] = useState(goal?.deadline || '')
  const [progress, setProgress] = useState(String(goal?.progress || 0))
  const [status, setStatus] = useState<Goal['status']>(goal?.status || 'active')

  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const data = {
      title: title.trim(),
      description: description.trim() || null,
      deadline: deadline || null,
      progress: Number(progress),
      status: status as Goal['status'],
    }

    if (goal) {
      await updateGoal.mutateAsync({ id: goal.id, ...data })
    } else {
      await createGoal.mutateAsync(data)
    }
    onClose()
  }

  const isLoading = createGoal.isPending || updateGoal.isPending

  return (
    <Modal open={open} onClose={onClose} title={goal ? 'Edit Goal' : 'New Goal'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Learn a new language" required autoFocus />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="block w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 px-3 py-2 text-sm resize-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <Input label="Progress (%)" type="number" min={0} max={100} value={progress} onChange={(e) => setProgress(e.target.value)} />
        </div>
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as Goal['status'])} options={STATUS_OPTIONS} />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isLoading}>{goal ? 'Update' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  )
}

function MilestoneItem({ milestone }: { milestone: Milestone }) {
  const toggleMilestone = useToggleMilestone()
  const deleteMilestone = useDeleteMilestone()
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(milestone.title)
  const updateMilestone = useUpdateMilestone()

  return (
    <div className="flex items-center gap-2 py-1.5 group">
      <button
        onClick={() => toggleMilestone.mutate({ id: milestone.id, completed: !milestone.completed })}
        className={clsx(
          'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0',
          milestone.completed
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 dark:border-slate-600 hover:border-green-400'
        )}
      >
        {milestone.completed && <Check className="h-3 w-3" />}
      </button>
      <div className="flex-1 min-w-0">
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              updateMilestone.mutate({ id: milestone.id, title: editTitle })
              setEditing(false)
            }}
            className="flex gap-1"
          >
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 text-xs border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              autoFocus
            />
            <button type="submit" className="text-xs text-indigo-600 dark:text-indigo-400 px-1">Save</button>
          </form>
        ) : (
          <span className={clsx('text-sm', milestone.completed && 'line-through text-gray-400 dark:text-slate-500')}>{milestone.title}</span>
        )}
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
        <button onClick={() => { setEditing(true); setEditTitle(milestone.title); }} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-400">
          <Edit3 className="h-3 w-3" />
        </button>
        <button onClick={() => deleteMilestone.mutate(milestone.id)} className="text-gray-400 dark:text-slate-500 hover:text-red-500">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

function GoalCard({ goal }: { goal: Goal & { milestones?: Milestone[] } }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [newMilestone, setNewMilestone] = useState('')
  const deleteGoal = useDeleteGoal()
  const createMilestone = useCreateMilestone()

  const statusStyle = GOAL_STATUSES.find((s) => s.value === goal.status)
  const milestones = goal.milestones || []
  const completedMilestones = milestones.filter((m) => m.completed).length

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMilestone.trim()) return
    createMilestone.mutate({ goal_id: goal.id, title: newMilestone.trim() })
    setNewMilestone('')
  }

  return (
    <>
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <Target className="h-8 w-8 text-indigo-500 dark:text-indigo-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-slate-100">{goal.title}</h3>
                {goal.description && <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 line-clamp-2">{goal.description}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => setEditing(true)}>
                  <Edit3 className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { if (confirm('Delete goal?')) deleteGoal.mutate(goal.id); }}>
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              {statusStyle && <Badge className={statusStyle.color}>{statusStyle.label}</Badge>}
              {goal.deadline && <Badge>Due {formatDate(goal.deadline)}</Badge>}
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500 dark:text-slate-400">Progress</span>
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{Math.round(goal.progress)}%</span>
              </div>
              <Progress value={goal.progress} color={goal.progress === 100 ? 'bg-green-500' : 'bg-indigo-600'} />
            </div>

            {milestones.length > 0 && (
              <div className="mt-3 border-t pt-2">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                >
                  {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  Milestones ({completedMilestones}/{milestones.length})
                </button>
                {expanded && (
                  <div className="mt-1 pl-2 border-l-2 border-gray-100 dark:border-slate-800">
                    {milestones
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((m) => (
                        <MilestoneItem key={m.id} milestone={m} />
                      ))}
                    <form onSubmit={handleAddMilestone} className="flex gap-1 mt-1">
                      <input
                        value={newMilestone}
                        onChange={(e) => setNewMilestone(e.target.value)}
                        placeholder="Add milestone..."
                        className="flex-1 text-xs border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      />
                      <button type="submit" className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Add</button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      <GoalForm goal={goal} open={editing} onClose={() => setEditing(false)} />
    </>
  )
}

export default function GoalsPage() {
  const { data: goals, isLoading } = useGoals()
  const [creating, setCreating] = useState(false)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Goals & Milestones</h1>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> New Goal
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full mt-2" />
            </Card>
          ))}
        </div>
      ) : goals?.length === 0 ? (
        <div className="text-center py-16">
          <Target className="h-12 w-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-gray-400 dark:text-slate-500 text-sm">No goals yet</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Set your first goal
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {goals?.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}

      <GoalForm open={creating} onClose={() => setCreating(false)} />
    </div>
  )
}
