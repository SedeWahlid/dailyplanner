'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Note } from '@/lib/types/database'

const supabase = createClient()

export function useNotes(date?: string) {
  return useQuery({
    queryKey: ['notes', date],
    queryFn: async () => {
      let query = supabase.from('notes').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false })
      if (date) {
        query = query.eq('date', date)
      }
      const { data, error } = await query
      if (error) throw error
      return data as Note[]
    },
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (note: Partial<Note>) => {
      const { data, error } = await supabase.from('notes').insert(note).select().single()
      if (error) throw error
      return data as Note
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...note }: Partial<Note> & { id: string }) => {
      const { data, error } = await supabase
        .from('notes')
        .update({ ...note, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Note
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  })
}
