'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Task } from '@/lib/types/database'
import { today } from '@/lib/utils/dates'

const supabase = createClient()

export function useTasks(date?: string) {
  return useQuery({
    queryKey: ['tasks', date],
    queryFn: async () => {
      let query = supabase.from('tasks').select('*, category:categories(*)')
      if (date) {
        query = query.eq('due_date', date)
      }
      query = query.order('sort_order').order('created_at')
      const { data, error } = await query
      if (error) throw error
      return data as (Task & { category: Task['category'] })[]
    },
  })
}

export function useTodayTasks() {
  return useTasks(today())
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('tasks').select('*, category:categories(*)').eq('id', id).single()
      if (error) throw error
      return data as Task & { category: Task['category'] }
    },
    enabled: !!id,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (task: Partial<Task>) => {
      const { data, error } = await supabase.from('tasks').insert(task).select('*, category:categories(*)').single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...task }: Partial<Task> & { id: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...task, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*, category:categories(*)')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useToggleTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ completed, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
