'use client'

import { useState } from 'react'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/lib/hooks/use-categories'
import { useAppStore } from '@/lib/stores/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Trash2, Edit3, FolderOpen } from 'lucide-react'
import { clsx } from 'clsx'
import type { Category } from '@/lib/types/database'

const COLOR_OPTIONS = [
  { value: '#6366f1', label: 'Indigo' },
  { value: '#22c55e', label: 'Green' },
  { value: '#ef4444', label: 'Red' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#14b8a6', label: 'Teal' },
]

const ICON_OPTIONS = [
  '📋', '💼', '👤', '❤️', '📚', '🏃', '🎯', '🎨',
  '💻', '🏠', '✈️', '🎵', '🍔', '💰', '📝', '⭐',
]

function CategoryForm({
  category,
  open,
  onClose,
}: {
  category?: Category | null
  open: boolean
  onClose: () => void
}) {
  const [name, setName] = useState(category?.name || '')
  const [color, setColor] = useState(category?.color || '#6366f1')
  const [icon, setIcon] = useState(category?.icon || '📋')

  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const data = { name: name.trim(), color, icon }

    if (category) {
      await updateCategory.mutateAsync({ id: category.id, ...data })
    } else {
      await createCategory.mutateAsync(data)
    }
    onClose()
  }

  const isLoading = createCategory.isPending || updateCategory.isPending

  return (
    <Modal open={open} onClose={onClose} title={category ? 'Edit Category' : 'New Category'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Work" required autoFocus />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Color</label>
          <div className="flex gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={clsx('w-8 h-8 rounded-full border-2 transition-all', color === c.value ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent')}
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Icon</label>
          <div className="grid grid-cols-8 gap-1">
            {ICON_OPTIONS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                className={clsx('w-9 h-9 rounded-lg text-lg flex items-center justify-center border-2 transition-all', icon === i ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600')}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isLoading}>{category ? 'Update' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  )
}

function CategoryRow({ category }: { category: Category }) {
  const [editing, setEditing] = useState(false)
  const deleteCategory = useDeleteCategory()

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl group">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
          style={{ backgroundColor: category.color + '20' }}
        >
          {category.icon}
        </div>
        <span className="text-sm font-medium text-gray-900 dark:text-slate-100 flex-1">{category.name}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" onClick={() => setEditing(true)}>
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => { if (confirm('Delete category?')) deleteCategory.mutate(category.id); }}>
            <Trash2 className="h-3.5 w-3.5 text-red-500" />
          </Button>
        </div>
      </div>
      <CategoryForm category={category} open={editing} onClose={() => setEditing(false)} />
    </>
  )
}

export default function SettingsPage() {
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { settings, setSetting } = useAppStore()
  const [creating, setCreating] = useState(false)

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">Settings</h1>

      <div className="space-y-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Categories</h2>
          {categoriesLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : categories?.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="h-10 w-10 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-gray-400 dark:text-slate-500">No categories</p>
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              {categories?.map((cat) => (
                <CategoryRow key={cat.id} category={cat} />
              ))}
            </div>
          )}
          <Button variant="outline" size="sm" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Theme</label>
              <div className="flex gap-2">
                {(['light', 'dark', 'system'] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setSetting('theme', theme)}
                    className={clsx(
                      'px-4 py-2 text-sm font-medium rounded-lg border transition-all',
                      settings.theme === theme
                        ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600'
                    )}
                  >
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Default Calendar View</label>
              <div className="flex gap-2">
                {(['day', 'week', 'month'] as const).map((view) => (
                  <button
                    key={view}
                    onClick={() => setSetting('defaultCalendarView', view)}
                    className={clsx(
                      'px-4 py-2 text-sm font-medium rounded-lg border transition-all',
                      settings.defaultCalendarView === view
                        ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600'
                    )}
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Week Starts On</label>
              <div className="flex gap-2">
                {(['Monday', 'Sunday'] as const).map((day, i) => (
                  <button
                    key={day}
                    onClick={() => setSetting('weekStartsOn', i === 0 ? 1 : 0)}
                    className={clsx(
                      'px-4 py-2 text-sm font-medium rounded-lg border transition-all',
                      settings.weekStartsOn === (i === 0 ? 1 : 0)
                        ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600'
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">About</h2>
          <div className="text-sm text-gray-600 dark:text-slate-400 space-y-1">
            <p>DailyPlanner v1.0.0</p>
            <p>Built with Next.js, Supabase, and FullCalendar</p>
          </div>
        </Card>
      </div>

      <CategoryForm open={creating} onClose={() => setCreating(false)} />
    </div>
  )
}
