'use client'

import { useState } from 'react'
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from '@/lib/hooks/use-notes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Edit3, Pin, Calendar, FileText } from 'lucide-react'
import { formatDate, today } from '@/lib/utils/dates'
import { MOODS } from '@/lib/types/database'
import { clsx } from 'clsx'
import type { Note } from '@/lib/types/database'

function NoteForm({
  note,
  open,
  onClose,
}: {
  note?: Note | null
  open: boolean
  onClose: () => void
}) {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [date, setDate] = useState(note?.date || today())
  const [mood, setMood] = useState(note?.mood || '')
  const [pinned, setPinned] = useState(note?.pinned || false)

  const createNote = useCreateNote()
  const updateNote = useUpdateNote()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    const data = {
      title: title.trim() || null,
      content: content.trim(),
      date,
      mood: mood || null,
      pinned,
    }

    if (note) {
      await updateNote.mutateAsync({ id: note.id, ...data })
    } else {
      await createNote.mutateAsync(data)
    }
    onClose()
  }

  const isLoading = createNote.isPending || updateNote.isPending

  return (
    <Modal open={open} onClose={onClose} title={note ? 'Edit Note' : 'New Note'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title..." autoFocus />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="Write your thoughts..."
            className="block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm resize-none bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Mood</label>
            <div className="flex gap-1.5">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(mood === m.value ? '' : m.value)}
                  className={clsx(
                    'w-10 h-10 rounded-lg text-lg flex items-center justify-center transition-all border-2',
                    mood === m.value
                      ? 'border-indigo-500 bg-indigo-50 scale-110 dark:border-indigo-400 dark:bg-indigo-900/30'
                      : 'border-gray-200 hover:border-gray-300 dark:border-slate-700 dark:hover:border-slate-600'
                  )}
                  title={m.label}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            className="rounded border-gray-300 dark:border-slate-600 text-indigo-600"
          />
          Pin this note
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isLoading}>{note ? 'Update' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  )
}

function NoteCard({ note }: { note: Note }) {
  const [editing, setEditing] = useState(false)
  const deleteNote = useDeleteNote()
  const updateNote = useUpdateNote()

  const handleDelete = () => {
    if (confirm('Delete this note?')) {
      deleteNote.mutate(note.id)
    }
  }

  const handleTogglePin = () => {
    updateNote.mutate({ id: note.id, pinned: !note.pinned })
  }

  const moodData = MOODS.find((m) => m.value === note.mood)

  return (
    <>
      <Card className={clsx('p-4 hover:shadow-md transition-shadow', note.pinned && 'border-indigo-200 bg-indigo-50/30 dark:border-indigo-800 dark:bg-indigo-900/20')}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            {note.title && <h3 className="font-medium text-gray-900 dark:text-slate-100 text-sm">{note.title}</h3>}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(note.date, 'MMM d, yyyy')}
              </span>
              {moodData && (
                <span className="text-sm" title={moodData.label}>{moodData.emoji}</span>
              )}
              {note.pinned && (
                <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                  <Pin className="h-3 w-3" />
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" onClick={handleTogglePin} title={note.pinned ? 'Unpin' : 'Pin'}>
              <Pin className={clsx('h-3.5 w-3.5', note.pinned && 'text-indigo-500 dark:text-indigo-400')} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setEditing(true)}>
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete}>
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-slate-400 whitespace-pre-wrap line-clamp-4">{note.content}</p>
      </Card>

      <NoteForm note={note} open={editing} onClose={() => setEditing(false)} />
    </>
  )
}

export default function NotesPage() {
  const { data: notes, isLoading } = useNotes()
  const [creating, setCreating] = useState(false)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Notes & Journal</h1>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> New Note
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-3/4 mt-1" />
            </Card>
          ))}
        </div>
      ) : notes?.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-gray-400 dark:text-slate-500 text-sm">No notes yet</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Start journaling
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {notes?.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}

      <NoteForm open={creating} onClose={() => setCreating(false)} />
    </div>
  )
}
