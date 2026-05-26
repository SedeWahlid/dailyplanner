'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Habit, HabitLog } from '@/lib/types/database'
import { today } from '@/lib/utils/dates'

const supabase = createClient()

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
      const { data, error } = await supabase.from('habit_logs').select('*').eq('log_date', date || today())
      if (error) throw error
      return data as HabitLog[]
    },
  })
}

export function useTodayHabitLogs() {
  return useHabitLogs(today())
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
