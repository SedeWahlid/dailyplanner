'use client'

import { Menu, LogOut, Moon, Sun, Monitor } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/stores/app-store'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils/dates'

const supabase = createClient()

export function Header() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const { settings, setSetting } = useAppStore()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const cycleTheme = () => {
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system']
    const currentIdx = themes.indexOf(settings.theme)
    setSetting('theme', themes[(currentIdx + 1) % themes.length])
  }

  const ThemeIcon = settings.theme === 'dark' ? Moon : settings.theme === 'light' ? Sun : Monitor

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
        >
          <Menu className="h-5 w-5" />
        </button>
        <p className="text-sm text-gray-500 dark:text-slate-400">{formatDate(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={cycleTheme} title={`Theme: ${settings.theme}`}>
          <ThemeIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
