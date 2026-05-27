'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Habit, HabitLog } from '@/lib/types/database'
import { today as todayStr } from '@/lib/utils/dates'
import { format, subDays } from 'date-fns'
import { useMemo } from 'react'

const supabase = createClient()

export interface StreakData {
  current: number
  longest: number
}

export type StreakMap = Record<string, StreakData>

function calculateStreaks(completedDates: string[]): StreakData {
  if (completedDates.length === 0) return { current: 0, longest: 0 }

  const today = todayStr()
  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = format(yesterdayDate, 'yyyy-MM-dd')

  let current = 0
  const mostRecent = completedDates[0]

  if (mostRecent === today || mostRecent === yesterday) {
    current = 1
    for (let i = 1; i < completedDates.length; i++) {
      const prev = new Date(completedDates[i - 1])
      const curr = new Date(completedDates[i])
      const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000)
      if (diff === 1) {
        current++
      } else {
        break
      }
    }
  }

  let longest = 1
  let run = 1
  for (let i = 1; i < completedDates.length; i++) {
    const prev = new Date(completedDates[i - 1])
    const curr = new Date(completedDates[i])
    const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000)
    if (diff === 1) {
      run++
      longest = Math.max(longest, run)
    } else {
      run = 1
    }
  }

  return { current, longest }
}

export function useHabits() {
  return useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      const { data, error } = await supabase.from('habits').select('*').eq('archived', false).order('sort_order')
      if (error) throw error
      return data as Habit[]
    },
  })
}

export function useHabitLogs(date?: string) {
  return useQuery({
    queryKey: ['habitLogs', date],
    queryFn: async () => {
      const { data, error } = await supabase.from('habit_logs').select('*').eq('log_date', date || todayStr())
      if (error) throw error
      return data as HabitLog[]
    },
  })
}

export function useTodayHabitLogs() {
  return useHabitLogs(todayStr())
}

export function useHabitLogsRange(from: string, to?: string) {
  const end = to || todayStr()
  return useQuery({
    queryKey: ['habitLogs', 'range', from, end],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habit_logs')
        .select('habit_id, log_date, completed, count')
        .gte('log_date', from)
        .lte('log_date', end)
        .order('log_date', { ascending: false })
      if (error) throw error
      return data as Pick<HabitLog, 'habit_id' | 'log_date' | 'completed' | 'count'>[]
    },
  })
}

export function useHabitStreaks(lookbackDays = 365) {
  const from = format(subDays(new Date(), lookbackDays), 'yyyy-MM-dd')
  const { data: logs, ...rest } = useHabitLogsRange(from)

  const streaks = useMemo<StreakMap>(() => {
    if (!logs) return {}
    const grouped: Record<string, string[]> = {}
    for (const log of logs) {
      if (!log.completed) continue
      if (!grouped[log.habit_id]) grouped[log.habit_id] = []
      grouped[log.habit_id].push(log.log_date)
    }
    const result: StreakMap = {}
    for (const [habitId, dates] of Object.entries(grouped)) {
      const unique = [...new Set(dates)].sort((a, b) => b.localeCompare(a))
      result[habitId] = calculateStreaks(unique)
    }
    return result
  }, [logs])

  return { ...rest, data: streaks, logs }
}

export function useHabitWeekLogs() {
  const from = format(subDays(new Date(), 6), 'yyyy-MM-dd')
  const to = todayStr()
  return useHabitLogsRange(from, to)
}

export function useCreateHabit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (habit: Partial<Habit>) => {
      const { data, error } = await supabase.from('habits').insert(habit).select().single()
      if (error) throw error
      return data as Habit
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] }),
  })
}

export function useUpdateHabit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...habit }: Partial<Habit> & { id: string }) => {
      const { data, error } = await supabase.from('habits').update(habit).eq('id', id).select().single()
      if (error) throw error
      return data as Habit
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] }),
  })
}

export function useDeleteHabit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('habits').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] }),
  })
}

export function useToggleHabit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ habitId, date, completed, count }: { habitId: string; date: string; completed: boolean; count: number }) => {
      const { data: existing } = await supabase.from('habit_logs').select('id').eq('habit_id', habitId).eq('log_date', date).maybeSingle()
      if (existing) {
        const { error } = await supabase.from('habit_logs').update({ completed, count }).eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('habit_logs').insert({ habit_id: habitId, log_date: date, completed, count })
        if (error) throw error
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habitLogs'] }),
  })
}
