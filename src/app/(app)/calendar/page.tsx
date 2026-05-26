'use client'

import { useState, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core'
import type { EventResizeDoneArg } from '@fullcalendar/interaction'
import { useTasks, useUpdateTask } from '@/lib/hooks/use-tasks'
import { useAppStore } from '@/lib/stores/app-store'
import { TaskForm } from '@/components/tasks/task-form'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Task } from '@/lib/types/database'
import { format } from 'date-fns'

export default function CalendarPage() {
  const { settings } = useAppStore()
  const { data: tasks, isLoading } = useTasks()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [newTaskDate, setNewTaskDate] = useState<string | null>(null)
  const [newTaskTime, setNewTaskTime] = useState<string | null>(null)
  const updateTask = useUpdateTask()

  const events = tasks?.map((task) => ({
    id: task.id,
    title: task.title,
    start: task.due_date
      ? task.due_time
        ? `${task.due_date}T${task.due_time}`
        : task.due_date
      : undefined,
    allDay: !task.due_time,
    backgroundColor: task.category?.color || '#6366f1',
    borderColor: task.category?.color || '#6366f1',
    extendedProps: {
      task,
      priority: task.priority,
      completed: task.completed,
    },
    className: task.completed ? 'opacity-50 line-through' : '',
  })) || []

  const handleEventClick = useCallback((info: EventClickArg) => {
    const task = info.event.extendedProps.task as Task
    setSelectedTask(task)
  }, [])

  const handleDateSelect = useCallback((info: DateSelectArg) => {
    setNewTaskDate(format(info.start, 'yyyy-MM-dd'))
    setNewTaskTime(format(info.start, 'HH:mm'))
  }, [])

  const handleEventDrop = useCallback(async (info: EventDropArg) => {
    const newDate = format(info.event.start!, 'yyyy-MM-dd')
    const newTime = info.event.allDay ? null : format(info.event.start!, 'HH:mm')
    try {
      await updateTask.mutateAsync({
        id: info.event.id,
        due_date: newDate,
        due_time: newTime,
      })
    } catch {
      info.revert()
    }
  }, [updateTask])

  const handleEventResize = useCallback(async (info: EventResizeDoneArg) => {
    try {
      const endTime = format(info.event.end!, 'HH:mm')
      await updateTask.mutateAsync({
        id: info.event.id,
        end_time: endTime,
      })
    } catch {
      info.revert()
    }
  }, [updateTask])

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <Skeleton className="h-8 w-40 mb-6" />
        <Card className="p-4">
          <Skeleton className="h-[600px] w-full" />
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">Calendar</h1>

      <Card className="p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={settings.defaultCalendarView === 'day' ? 'timeGridDay' : settings.defaultCalendarView === 'week' ? 'timeGridWeek' : 'dayGridMonth'}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridDay,timeGridWeek,dayGridMonth',
          }}
          events={events}
          editable
          selectable
          selectMirror
          dayMaxEvents={3}
          firstDay={settings.weekStartsOn}
          height="auto"
          eventClick={handleEventClick}
          select={handleDateSelect}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          allDaySlot
          nowIndicator
          weekNumbers={false}
          eventContent={(eventInfo) => (
            <div className="flex items-center gap-1.5 px-1.5 py-0.5 text-xs overflow-hidden">
              {eventInfo.event.extendedProps.priority === 3 && (
                <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
              )}
              <span className="truncate">{eventInfo.event.title}</span>
            </div>
          )}
        />
      </Card>

      <TaskForm
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />

      <TaskForm
        open={!!newTaskDate}
        onClose={() => { setNewTaskDate(null); setNewTaskTime(null); }}
        task={newTaskDate ? {
          id: '',
          title: '',
          description: null,
          completed: false,
          priority: 0,
          due_date: newTaskDate,
          due_time: newTaskTime,
          start_time: null,
          end_time: null,
          category_id: null,
          is_recurring: false,
          recurrence_rule: null,
          sort_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } : null}
      />
    </div>
  )
}
