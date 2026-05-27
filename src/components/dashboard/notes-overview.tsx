'use client'

import { useNotes } from '@/lib/hooks/use-notes'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, ArrowRight, Pin } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils/dates'
import { MOODS } from '@/lib/types/database'
import { clsx } from 'clsx'

export function NotesOverview() {
  const { data: notes, isLoading } = useNotes()

  if (isLoading) {
    return (
      <Card className="p-4">
        <Skeleton className="h-5 w-32 mb-3" />
        <div className="space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </Card>
    )
  }

  const displayNotes = notes?.slice(0, 3) ?? []

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm">Recent Notes</h3>
        </div>
        <Link href="/notes" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 shrink-0">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {displayNotes.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-6">
          No notes yet
        </p>
      ) : (
        <div className="space-y-2.5">
          {displayNotes.map((note) => {
            const moodData = MOODS.find((m) => m.value === note.mood)
            return (
              <div
                key={note.id}
                className={clsx(
                  'p-2.5 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50',
                  note.pinned && 'bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {note.pinned && <Pin className="h-3 w-3 text-amber-500 shrink-0" />}
                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                        {note.title || 'Untitled'}
                      </p>
                      {moodData && <span className="text-xs shrink-0">{moodData.emoji}</span>}
                    </div>
                    {note.content && (
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1">{note.content}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-slate-500 shrink-0 mt-0.5">
                    {formatDate(note.date, 'MMM d')}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
