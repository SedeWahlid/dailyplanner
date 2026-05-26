'use client'

import { useState } from 'react'
import { useCreateNote } from '@/lib/hooks/use-notes'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { today } from '@/lib/utils/dates'
import { FileText, Send } from 'lucide-react'

export function QuickNote() {
  const [content, setContent] = useState('')
  const createNote = useCreateNote()

  const handleSave = async () => {
    if (!content.trim()) return
    await createNote.mutateAsync({
      content: content.trim(),
      date: today(),
    })
    setContent('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave()
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm">Quick Note</h3>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write a quick note... (Cmd+Enter to save)"
        className="w-full h-28 resize-none rounded-lg border border-gray-200 dark:border-slate-600 p-3 text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-gray-50 dark:bg-slate-700/50"
      />
      <div className="flex justify-end mt-2">
        <Button size="sm" onClick={handleSave} loading={createNote.isPending} disabled={!content.trim()}>
          <Send className="h-3.5 w-3.5" />
          Save note
        </Button>
      </div>
    </Card>
  )
}
