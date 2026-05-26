'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Goal, Milestone } from '@/lib/types/database'

const supabase = createClient()

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data, error } = await supabase.from('goals').select('*, milestones(*)').order('sort_order')
      if (error) throw error
      return data as (Goal & { milestones: Milestone[] })[]
    },
  })
}

export function useCreateGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (goal: Partial<Goal>) => {
      const { data, error } = await supabase.from('goals').insert(goal).select().single()
      if (error) throw error
      return data as Goal
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  })
}

export function useUpdateGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...goal }: Partial<Goal> & { id: string }) => {
      const { data, error } = await supabase
        .from('goals')
        .update({ ...goal, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Goal
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('goals').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  })
}

export function useCreateMilestone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (milestone: Partial<Milestone>) => {
      const { data, error } = await supabase.from('milestones').insert(milestone).select().single()
      if (error) throw error
      return data as Milestone
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  })
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...milestone }: Partial<Milestone> & { id: string }) => {
      const { data, error } = await supabase.from('milestones').update(milestone).eq('id', id).select().single()
      if (error) throw error
      return data as Milestone
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  })
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('milestones').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  })
}

export function useToggleMilestone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const update = completed ? { completed: true, completed_at: new Date().toISOString() } : { completed: false, completed_at: null }
      const { error } = await supabase.from('milestones').update(update).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  })
}
